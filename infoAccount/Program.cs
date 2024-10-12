using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Banners.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<InfoAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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


app.MapGet("/api/InfoAccount", async (InfoAccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});


app.MapPost("/api/InfoAccount", async (ModelInfoAccount infoAccount, InfoAccountDbContext dbContext) =>
{
    try
    {
        dbContext.Account.Add(infoAccount);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred while saving the account: " + ex.Message);
    }
});


app.MapPost("/api/InfoAccountavata", async (HttpRequest request, InfoAccountDbContext db) =>
{
    if (!request.HasFormContentType) return Results.BadRequest("Content-Type must be multipart/form-data");

    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var idString = formCollection["id"];

    if (!int.TryParse(idString, out var id)) return Results.BadRequest("Invalid ID format");

    if (file == null || file.Length == 0)
        return Results.BadRequest("No file uploaded");

    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
    await blobContainerClient.CreateIfNotExistsAsync();

    var blobClient = blobContainerClient.GetBlobClient($"{id}/{file.FileName}");
    await blobClient.DeleteIfExistsAsync();

    await using var stream = file.OpenReadStream();
    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

    var coverImgUrl = blobClient.Uri.ToString();
    var existingAccount = await db.Account.FindAsync(id);

    if (existingAccount == null) return Results.NotFound("Account not found");

    existingAccount.cover_img = coverImgUrl;
    db.Account.Update(existingAccount);
    await db.SaveChangesAsync();

    return Results.Ok(true);
});
app.MapPut("/api/InfoAccountupdate", async (ModelInfoAccount infoAccount, InfoAccountDbContext db) =>
{
    try
    {
        db.Account.Update(infoAccount);
        await db.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

app.Run();