using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Banner.Data;
using Banners.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<BannerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
        policyBuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");


app.MapGet("/api/banner", async (BannerDbContext dbContext) =>
{
    var banners = await dbContext.Banner.ToListAsync();
    return Results.Ok(banners);
});


app.MapPost("/api/banner", async (HttpRequest request, BannerDbContext db) =>
{
    if (!request.HasFormContentType)
        return Results.BadRequest("Content-Type must be multipart/form-data");
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var urlLink = formCollection["name"];

    if (file == null || file.Length == 0)
        return Results.BadRequest("No file uploaded");
    var banner = new ModelBanner
    {
        url_manga = urlLink,
        datePosted = DateTime.Now
    };
    db.Banner.Add(banner);
    await db.SaveChangesAsync();
    var id = banner.Id_Banner;
    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("banners");
    await blobContainerClient.CreateIfNotExistsAsync();
    var blobClient = blobContainerClient.GetBlobClient($"{id}/{file.FileName}");
    await blobClient.DeleteIfExistsAsync();
    await using var stream = file.OpenReadStream();
    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
    var coverImgUrl = blobClient.Uri.ToString();
    banner.image_banner = coverImgUrl;
    db.Banner.Update(banner);
    await db.SaveChangesAsync();

    return Results.Ok(true);
});

app.MapDelete("/api/banner/{id}", async (int id, BannerDbContext dbContext) =>
{
    var banner = await dbContext.Banner.FindAsync(id);
    if (banner == null) return Results.NotFound("Banner not found");
    dbContext.Banner.Remove(banner);
    await dbContext.SaveChangesAsync();
    return Results.Ok(true);
});
app.Run();