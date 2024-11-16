﻿using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaApi
{
    public static void MapMangaEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/manga", GetAllActiveManga);
        app.MapGet("/api/manga/posted", GetPostedManga);
        app.MapGet("/api/manga/unPosted", GetUnPostedManga);
        app.MapGet("/api/manga/get/{idManga:int}", GetMangaById);
        app.MapGet("/api/manga/user/{idAccount:int}", GetUserManga);
        app.MapPost("api/manga/upload/{idUser:int}", UploadManga);
        app.MapPut("/api/manga/update/{idManga:int}", UpdateManga);
        app.MapPut("/api/manga/ratingChange", ChangeRating);
        app.MapPut("/api/manga/updateTime", UpdateMangaTime);
        app.MapPut("/api/manga/changeStatus", ToggleMangaStatus);
        app.MapDelete("/api/manga/delete/{idManga:int}", DeleteManga);
    }

    private static async Task<IResult> GetAllActiveManga(MangaDbContext dbContext)
    {
        try
        {
            var mangas = await dbContext.Manga.AsNoTracking()
                .Where(manga => manga.num_of_chapter > 0 && manga.is_posted && !manga.is_deleted)
                .ToListAsync();
            return Results.Ok(mangas);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving active manga." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> GetPostedManga(MangaDbContext dbContext)
    {
        try
        {
            var mangas = await dbContext.Manga.AsNoTracking()
                .Where(manga => manga.is_posted && !manga.is_deleted)
                .ToListAsync();
            return Results.Ok(mangas);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving posted manga." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> GetUnPostedManga(MangaDbContext dbContext)
    {
        try
        {
            var mangas = await dbContext.Manga.AsNoTracking()
                .Where(manga => !manga.is_deleted && !manga.is_posted)
                .ToListAsync();
            return Results.Ok(mangas);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving unPosted manga." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }


    private static async Task<IResult> GetMangaById(int idManga, MangaDbContext dbContext)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            return manga == null ? Results.NotFound("Manga not found") : Results.Ok(manga);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving the manga." + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetUserManga(int idAccount, MangaDbContext dbContext)
    {
        try
        {
            var mangas = await dbContext.Manga.AsNoTracking()
                .Where(manga => manga.id_account == idAccount && !manga.is_deleted)
                .ToListAsync();
            return Results.Ok(mangas);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving user manga." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }


    private static async Task<IResult> UploadManga(MangaDbContext db, int idUser, HttpRequest request,
        IConfiguration configuration)
    {
        try
        {
            var formCollection = await request.ReadFormAsync();
            var file = formCollection.Files.FirstOrDefault();
            var name = formCollection["name"];
            var author = formCollection["author"];
            var describe = formCollection["describe"];

            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded");

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

            var folderName = manga.id_manga.ToString();
            var connectionString = configuration["AzureStorage:ConnectionString"];
            var blobServiceClient = new BlobServiceClient(connectionString);
            var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
            var blobClient = blobContainerClient.GetBlobClient($"{folderName}/{file.FileName}");

            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

            manga.cover_img = blobClient.Uri.ToString();
            db.Manga.Update(manga);
            await db.SaveChangesAsync();

            return Results.Ok(manga.id_manga);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while uploading the manga." + ex.Message + "\n" + ex.StackTrace);
        }
    }


    private static async Task<IResult> UpdateManga(MangaDbContext dbContext, int idManga, HttpRequest request,
        IConfiguration configuration)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            if (manga == null) return Results.NotFound("Manga not found");

            var formCollection = await request.ReadFormAsync();
            var file = formCollection.Files.FirstOrDefault();
            var name = formCollection["name"];
            var author = formCollection["author"];
            var describe = formCollection["describe"];

            manga.name = name;
            manga.author = author;
            manga.describe = describe;

            if (file is { Length: > 0 })
            {
                var folderName = manga.id_manga.ToString();
                const string fileName = "Cover.jpg";
                var connectionString = configuration["AzureStorage:ConnectionString"];
                var blobServiceClient = new BlobServiceClient(connectionString);
                var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
                var oldBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");

                if (await oldBlobClient.ExistsAsync())
                    await oldBlobClient.DeleteAsync();

                var newBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");
                await using var stream = file.OpenReadStream();
                await newBlobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

                manga.cover_img = newBlobClient.Uri.ToString();
            }

            dbContext.Manga.Update(manga);
            await dbContext.SaveChangesAsync();

            return Results.Ok(manga.id_manga);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while updating the manga." + ex.Message + "\n" + ex.StackTrace);
        }
    }


    private static async Task<IResult> ChangeRating(MangaDbContext dbContext, int idManga, int ratedScore)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            if (manga == null) return Results.NotFound(new { message = "Manga not found." });

            var oldRating = manga.rating;
            var oldRatedNum = manga.rated_num;
            var newRatedNum = oldRatedNum + 1;

            manga.rating = (oldRating * oldRatedNum + ratedScore) / newRatedNum;
            manga.rated_num = newRatedNum;

            await dbContext.SaveChangesAsync();
            return Results.Ok(new { manga.id_manga, manga.rating });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while updating the rating." + ex.Message + "\n" + ex.StackTrace);
        }
    }


    private static async Task<IResult> UpdateMangaTime(MangaDbContext dbContext, int idManga)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            if (manga == null) return Results.NotFound("Manga not found");

            manga.updated_at = DateTime.Now;
            manga.num_of_chapter += 1;

            dbContext.Manga.Update(manga);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { manga.id_manga, manga.updated_at });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while updating the manga time." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> ToggleMangaStatus(MangaDbContext dbContext, int idManga)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            if (manga == null) return Results.NotFound("Manga not found");

            manga.is_posted = !manga.is_posted;

            await dbContext.SaveChangesAsync();

            return Results.Ok(new { manga.id_manga, manga.is_posted });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while toggling the manga status." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }


    private static async Task<IResult> DeleteManga(MangaDbContext dbContext, int idManga, IConfiguration configuration)
    {
        try
        {
            var manga = await dbContext.Manga.FindAsync(idManga);
            if (manga == null) return Results.NotFound("Manga not found");

            var folderName = manga.id_manga.ToString();
            var connectionString = configuration["AzureStorage:ConnectionString"];
            var blobServiceClient = new BlobServiceClient(connectionString);
            var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");

            await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: folderName))
            {
                var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
                await blobClient.DeleteIfExistsAsync();
            }

            manga.is_deleted = true;
            dbContext.Manga.Update(manga);
            await dbContext.SaveChangesAsync();

            return Results.Ok($"Manga with id {idManga} has been deleted.");
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while deleting the manga." + ex.Message + "\n" + ex.StackTrace);
        }
    }
}