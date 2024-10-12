using System.Text;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MangaService;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<MangaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/manga", async (MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga
        .Where(manga => manga.num_of_chapter > 0 && manga.is_posted == true && manga.is_deleted == false).ToListAsync();
    return Results.Ok(mangas);
});

app.MapGet("/api/manga/get/{id_manga}", async (int id_manga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    return manga == null ? Results.NotFound("Manga not found") : Results.Ok(manga);
});

app.MapGet("/api/manga/user/{id_account}", async (int id_account, MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga.Where(manga => manga.id_account == id_account && manga.is_deleted == false)
        .ToListAsync();
    return Results.Ok(mangas);
});

app.MapGet("/api/manga/category/{id_category}", async (int id_category, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync();
    return manga == null ? Results.NotFound("Manga not found") : Results.Ok(manga);
});

app.MapPost("api/manga/upload/{idUser:int}", async (HttpRequest request, int idUser, MangaDbContext db) =>
{
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var name = formCollection["name"];
    var author = formCollection["author"];
    var describe = formCollection["describe"];
    var categoryIds = formCollection["categories"].ToString().Split(',').Select(int.Parse).ToList();

    if (file == null || file.Length == 0) return Results.BadRequest("No file uploaded");

    var manga = new Manga
    {
        name = name,
        author = author,
        id_account = idUser,
        describe = describe,
        updated_at = DateTime.Now
    };

    db.Manga.Add(manga);
    await db.SaveChangesAsync();
    categoryIds.Insert(0, manga.id_manga);
    using (var httpClient = new HttpClient())
    {
        var content = new StringContent(JsonConvert.SerializeObject(categoryIds), Encoding.UTF8, "application/json");
        await httpClient.PostAsync("https://localhost:44347/api/add_manga_category", content);
    }

    await db.SaveChangesAsync();

    var folderName = manga.id_manga.ToString();
    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
    var blobClient = blobContainerClient.GetBlobClient($"{folderName}/{file.FileName}");
    await using var stream = file.OpenReadStream();
    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

    manga.cover_img = blobClient.Uri.ToString();
    db.Manga.Update(manga);
    await db.SaveChangesAsync();

    return Results.Ok(new { manga.id_manga, manga.cover_img });
});

app.MapPut("/api/manga/{id_manga}", async (int id_manga, HttpRequest request, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    if (manga == null) return Results.NotFound("Manga not found");
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var name = formCollection["name"];
    var author = formCollection["author"];
    manga.name = name;
    manga.author = author;

    if (file is { Length: > 0 })
    {
        var folderName = manga.id_manga.ToString();
        const string fileName = "Cover.jpg";

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var oldBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");
        if (await oldBlobClient.ExistsAsync()) await oldBlobClient.DeleteAsync();
        var newBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");
        await using var stream = file.OpenReadStream();
        await newBlobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        manga.cover_img = newBlobClient.Uri.ToString();
    }

    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();

    return Results.Ok(new { manga.id_manga, manga.cover_img });
});

app.MapPut("/api/manga/updateTime", async (int id_manga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    if (manga == null) return Results.NotFound("Manga not found");
    manga.updated_at = DateTime.Now;
    manga.num_of_chapter += 1;
    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();
    return Results.Ok(new { manga.id_manga, manga.updated_at });
});

app.MapDelete("/api/manga/delete/{id_manga}", async (int id_manga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    if (manga == null) return Results.NotFound("Manga not found");
    var folderName = manga.id_manga.ToString();

    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
    await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: folderName))
    {
        var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
        await blobClient.DeleteIfExistsAsync();
    }

    manga.is_deleted = true;
    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();

    return Results.Ok($"Manga with id {id_manga} has been deleted.");
});
app.UseCors("AllowAllOrigins");
app.Run();