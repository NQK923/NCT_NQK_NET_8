using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ChapterService;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<ChapterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/manga/{id_manga:int}/chapters", async (int id_manga, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga)
        .ToListAsync();

    return chapters.Count == 0 ? Results.NotFound("No chapters found for this manga.") : Results.Ok(chapters);
});

app.MapGet("/api/manga/{id_manga:int}/totalviews", async (int id_manga, ChapterDbContext dbContext) =>
{
    var totalViews = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga)
        .SumAsync(c => c.view);
    return Results.Ok(new { TotalViews = totalViews });
});

app.MapGet("/api/manga/{id_manga:int}/chapters/{index:int}/images", async (int id_manga, int index) =>
{
    const string storageConnectionString =
        "DefaultEndpointsProtocol=https;AccountName=mangaimg;AccountKey=ixD9POSbdB6bk18HPlxSo6gdiq4CiklM5/pYl61K36Q45kNTvn/7jnvk9hoe5FcnMQLtoXLysXvO+AStp4kRfQ==;EndpointSuffix=core.windows.net";

    const string containerName = "mangas";
    var prefix = $"{id_manga}/Chapters/{index}";

    var blobServiceClient = new BlobServiceClient(storageConnectionString);
    var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

    var imageUrls = new List<string>();

    await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
    {
        var imageUrl = $"https://{blobServiceClient.AccountName}.blob.core.windows.net/{containerName}/{blobItem.Name}";
        imageUrls.Add(imageUrl);
    }

    return Results.Ok(imageUrls);
});

app.MapGet("/api/manga/{id_manga}/chapter/{index}", async (int id_manga, int index, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga && c.index == index)
        .ToListAsync();

    return chapters.Count == 0 ? Results.NotFound("No chapters found.") : Results.Ok(chapters);
});

app.MapPut("/api/manga/{id_chapter:int}/incrementView", async (int id_chapter, ChapterDbContext dbContext) =>
{
    var chapter = await dbContext.Chapter.FindAsync(id_chapter);
    if (chapter == null) return Results.NotFound("Chapter not found.");
    chapter.view += 1;
    await dbContext.SaveChangesAsync();

    return Results.Ok(chapter);
});

app.MapPost("/api/manga/upload/chapter",
    async (HttpRequest request, ChapterDbContext db, IHttpClientFactory httpClientFactory) =>
    {
        var formCollection = await request.ReadFormAsync();
        var files = formCollection.Files;
        var title = formCollection["title"];
        var index = formCollection["index"];
        var id_manga = formCollection["id_manga"];

        if (files.Count == 0) return Results.BadRequest("No files uploaded");

        var chapterIndex = int.Parse(index);
        var mangaId = int.Parse(id_manga);

        var existingChapter = await db.Chapter
            .FirstOrDefaultAsync(c => c.id_manga == mangaId && c.index == chapterIndex);

        if (existingChapter != null)
            return Results.Conflict(new { message = "Chapter index already exists", existingChapter });

        var chapter = new Chapter
        {
            id_manga = mangaId,
            title = title,
            index = chapterIndex,
            created_at = DateTime.Now
        };

        db.Chapter.Add(chapter);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = id_manga.ToString();

        foreach (var file in files)
        {
            var blobClient = blobContainerClient.GetBlobClient($"{folderName}/Chapters/{index}/{file.FileName}");
            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        }

        var httpClient = httpClientFactory.CreateClient();
        var response =
            await httpClient.PutAsync($"https://localhost:44355/api/manga/updateTime?id_manga={mangaId}", null);

        return !response.IsSuccessStatusCode
            ? Results.BadRequest("Failed to update manga")
            : Results.Ok(new { chapter.id_manga, chapter.index });
    });


app.MapPut("/api/manga/update/chapter/{chapterId:int}",
    async (int chapterId, HttpRequest request, ChapterDbContext db) =>
    {
        var chapter = await db.Chapter.FindAsync(chapterId);
        if (chapter == null) return Results.NotFound("Chapter not found");

        var formCollection = await request.ReadFormAsync();
        var files = formCollection.Files;
        var title = formCollection["title"];

        chapter.title = title;
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = chapter.id_manga.ToString();
        var index = chapter.index;

        var oldImagesPrefix = $"{folderName}/Chapters/{index}/";
        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: oldImagesPrefix))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        foreach (var file in files)
        {
            var blobClient = blobContainerClient.GetBlobClient($"{folderName}/Chapters/{index}/{file.FileName}");
            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        }

        return Results.Ok(new { chapter.id_manga, chapter.index });
    });

app.MapDelete("/api/manga/delete/{idManga:int}/chapter/{index:int}",
    async (int idManga, int index, ChapterDbContext db) =>
    {
        var chapter = await db.Chapter
            .FirstOrDefaultAsync(c => c.id_manga == idManga && c.index == index);

        if (chapter == null)
            return Results.NotFound("Chapter not found");

        db.Chapter.Remove(chapter);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();
        var chapterFolderPath = $"{folderName}/Chapters/{index}";

        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: chapterFolderPath))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        return Results.Ok(new { message = "Chapter deleted successfully" });
    });

app.MapDelete("/api/manga/delete/chapters/{idManga:int}",
    async (int idManga, ChapterDbContext db) =>
    {
        var chapters = await db.Chapter
            .Where(c => c.id_manga == idManga)
            .ToListAsync();

        if (!chapters.Any())
            return Results.NotFound("No chapters found for this manga");

        db.Chapter.RemoveRange(chapters);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();
        var chapterFolderPath = $"{folderName}/Chapters/";

        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: chapterFolderPath))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        return Results.Ok(new { message = "All chapters deleted successfully" });
    });


app.UseCors("AllowAllOrigins");
app.Run();