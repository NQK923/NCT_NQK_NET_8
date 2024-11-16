using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaFavoriteApi
{
    public static void MapMangaFavoriteEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/mangas/favorite", GetAllFavoritesByAccount);
        app.MapGet("/api/mangas/getAllFollower", GetAllFollowersByManga);
        app.MapGet("/api/mangas/isSendNoti", GetAccountsToNotify);
        app.MapGet("/api/mangas/isFavorite", CheckFavoriteStatus);
        app.MapGet("/api/mangas/toggleNotification", ToggleNotificationStatus);
        app.MapPost("/api/mangas/favorite/toggle", ToggleFavoriteStatus);
    }

    private static async Task<IResult> GetAllFavoritesByAccount(int idAccount, MangaDbContext dbContext)
    {
        try
        {
            var favorites = await dbContext.Manga_Favorite
                .AsNoTracking()
                .Where(f => f.id_account == idAccount && f.is_favorite)
                .ToListAsync();
            return Results.Ok(favorites);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving favorites." + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetAllFollowersByManga(int idManga, MangaDbContext dbContext)
    {
        try
        {
            var totalFollowers = await dbContext.Manga_Favorite
                .AsNoTracking()
                .Where(f => f.id_manga == idManga)
                .CountAsync();
            return Results.Ok(totalFollowers);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving followers." + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetAccountsToNotify(int idManga, MangaDbContext dbContext)
    {
        try
        {
            var accountIds = await dbContext.Manga_Favorite
                .Where(f => f.id_manga == idManga && f.is_favorite && f.is_notification)
                .Select(f => f.id_account)
                .ToListAsync();
            return Results.Ok(accountIds);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving accounts to notify." + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }


    private static async Task<IResult> CheckFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var favorite = await dbContext.Manga_Favorite
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.id_account == idAccount && f.id_manga == idManga);
            return Results.Ok(favorite is { is_favorite: true });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while checking favorite status. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> ToggleNotificationStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var favorite = await dbContext.Manga_Favorite
                .FirstOrDefaultAsync(f => f.id_account == idAccount && f.id_manga == idManga);

            if (favorite == null) return Results.NotFound();

            favorite.is_notification = !favorite.is_notification;
            await dbContext.SaveChangesAsync();
            return Results.Ok(favorite);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while toggling notification status. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> ToggleFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var favorite = await dbContext.Manga_Favorite
                .FirstOrDefaultAsync(f => f.id_account == idAccount && f.id_manga == idManga);

            if (favorite != null)
            {
                favorite.is_notification = favorite switch
                {
                    { is_favorite: true, is_notification: true } => false,
                    { is_favorite: false, is_notification: false } => true,
                    _ => favorite.is_notification
                };
                favorite.is_favorite = !favorite.is_favorite;
            }
            else
            {
                favorite = new Manga_Favorite
                {
                    id_account = idAccount,
                    id_manga = idManga,
                    is_favorite = true,
                    is_notification = true
                };
                await dbContext.Manga_Favorite.AddAsync(favorite);
            }

            await dbContext.SaveChangesAsync();
            return Results.Ok(favorite);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while toggling favorite status. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }
}