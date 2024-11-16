using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaHistoryApi
{
    public static void MapMangaHistoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/mangas/history/{idAccount:int}/{idManga:int}", GetHistoryByAccountAndManga);
        app.MapGet("/api/mangas/simple_history/{idAccount:int}", GetLatestHistoryByAccount);
        app.MapPost("/api/mangas/create/history", CreateOrUpdateHistory);
        app.MapDelete("/api/mangas/delete/{idAccount:int}/{idManga:int}", DeleteHistoryByAccountAndManga);
    }

    private static async Task<IResult> GetHistoryByAccountAndManga(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var histories = await dbContext.MangaHistory
                .AsNoTracking()
                .Where(history => history.id_account == idAccount && history.id_manga == idManga)
                .ToListAsync();

            return histories.Count == 0
                ? Results.NotFound("No history found for this account and manga.")
                : Results.Ok(histories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving history. " + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetLatestHistoryByAccount(int idAccount, MangaDbContext dbContext)
    {
        try
        {
            var recentHistories = await dbContext.MangaHistory
                .AsNoTracking()
                .Where(history => history.id_manga == idAccount)
                .GroupBy(history => history.id_manga)
                .Select(group => group.OrderByDescending(history => history.time).FirstOrDefault())
                .ToListAsync();

            return Results.Ok(recentHistories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving the latest history. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }


    private static async Task<IResult> CreateOrUpdateHistory(MangaHistoryRequest request, MangaDbContext dbContext)
    {
        try
        {
            var existingHistory = await dbContext.MangaHistory
                .FirstOrDefaultAsync(h =>
                    h.id_account == request.IdAccount &&
                    h.id_manga == request.IdManga &&
                    h.index_chapter == request.IndexChapter);

            if (existingHistory != null)
            {
                existingHistory.time = DateTime.Now;
                dbContext.MangaHistory.Update(existingHistory);
            }
            else
            {
                var newHistory = new MangaHistory
                {
                    id_account = request.IdAccount,
                    id_manga = request.IdManga,
                    index_chapter = request.IndexChapter,
                    time = DateTime.Now
                };
                await dbContext.MangaHistory.AddAsync(newHistory);
            }

            await dbContext.SaveChangesAsync();
            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while creating or updating history. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> DeleteHistoryByAccountAndManga(int idAccount, int idManga,
        MangaDbContext dbContext)
    {
        try
        {
            var existingHistory = await dbContext.MangaHistory
                .FirstOrDefaultAsync(h => h.id_account == idAccount && h.id_manga == idManga);

            if (existingHistory == null) return Results.NotFound(new { message = "History record not found." });

            dbContext.MangaHistory.Remove(existingHistory);
            await dbContext.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while deleting the history record. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }
}