using Account.Data;
using Account.Model;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.EntityFrameworkCore;

namespace Account.Api;

public static class InfoAccountApi
{
    public static void MapInfoAccountEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/InfoAccount", GetAllInfoAccounts);
        app.MapGet("/api/InfoAccountById/{idaccount}", GetInfoAccountById);
        app.MapPost("/api/InfoAccount", AddNewInfoAccount);
        app.MapPost("/api/InfoAccountavata", AddUserAvatar);
        app.MapPut("/api/InfoAccountupdate", UpdateInfoAccount);
    }

    private static async Task<IResult> GetAllInfoAccounts(AccountDbContext dbContext)
    {
        var accounts = await dbContext.InfoAccount.ToListAsync();
        return Results.Ok(accounts);
    }

    private static async Task<IResult> GetInfoAccountById(AccountDbContext dbContext, int idaccount)
    {
        var account = await dbContext.InfoAccount.FindAsync(idaccount);
        return account == null ? Results.NotFound() : Results.Ok(account);
    }

    private static async Task<IResult> AddNewInfoAccount(InfoAccount infoAccount, AccountDbContext dbContext)
    {
        try
        {
            var exists = await dbContext.InfoAccount.AnyAsync(m => m.id_account == infoAccount.id_account);
            if (exists) return Results.Ok(false);

            dbContext.InfoAccount.Add(infoAccount);
            await dbContext.SaveChangesAsync();
            return Results.Ok(true);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while saving the account: " + ex.Message);
        }
    }

    private static async Task<IResult> AddUserAvatar(HttpRequest request, AccountDbContext db,
        IConfiguration configuration)
    {
        if (!request.HasFormContentType) return Results.BadRequest("Content-Type must be multipart/form-data");

        var formCollection = await request.ReadFormAsync();
        var file = formCollection.Files.FirstOrDefault();
        var idString = formCollection["id"];

        if (!int.TryParse(idString, out var id)) return Results.BadRequest("Invalid ID format");
        if (file == null || file.Length == 0) return Results.BadRequest("No file uploaded");

        var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
        await blobContainerClient.CreateIfNotExistsAsync();

        var blobs = blobContainerClient.GetBlobsAsync(prefix: $"{id}/");
        await foreach (var blobItem in blobs)
        {
            var blobToDelete = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobToDelete.DeleteIfExistsAsync();
        }

        var blobClient = blobContainerClient.GetBlobClient($"{id}/{file.FileName}");
        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

        var coverImgUrl = blobClient.Uri.ToString();
        var existingAccount = await db.InfoAccount.FindAsync(id);

        if (existingAccount == null) return Results.NotFound("Account not found");

        existingAccount.cover_img = coverImgUrl;
        db.InfoAccount.Update(existingAccount);
        await db.SaveChangesAsync();

        return Results.Ok(true);
    }

    private static async Task<IResult> UpdateInfoAccount(InfoAccount infoAccount, AccountDbContext db)
    {
        try
        {
            db.InfoAccount.Update(infoAccount);
            await db.SaveChangesAsync();
            return Results.Ok(true);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred during account update: " + ex.Message);
        }
    }
}