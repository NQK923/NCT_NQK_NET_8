using CategoryService.Data;
using CategoryService.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Api;

public static class CategoryDetailsApi
{
    public static void MapCategoryDetailsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/CategoryDetails/get_all", GetAllCategoryDetails);
        app.MapGet("/api/CategoryDetails/{idManga:int}", GetCategoryDetailsByMangaId);
        app.MapPost("/api/CategoryDetails/getIdManga", GetMangaIdsByCategories);
        app.MapPost("/api/add_manga_category", AddCategoryDetails);
        app.MapPut("/api/update_manga_category", UpdateCategoryDetails);
        app.MapDelete("/api/CategoryDetails/delete", DeleteCategoryDetailsByManga);
    }

    private static async Task<IResult> GetAllCategoryDetails(CategoryDbContext dbContext)
    {
        try
        {
            var categories = await dbContext.Category_details.AsNoTracking().ToListAsync();
            return categories.Count == 0
                ? Results.NotFound(new { Message = "No categories found." })
                : Results.Ok(categories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> GetCategoryDetailsByMangaId(int idManga, CategoryDbContext dbContext)
    {
        try
        {
            var categories = await dbContext.Category_details
                .Where(details => details.id_manga == idManga)
                .AsNoTracking()
                .ToListAsync();
            return Results.Ok(categories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving category details by manga ID. " + ex.Message +
                                   "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetMangaIdsByCategories(
        [FromBody] List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            var mangaIds = await dbContext.Category_details
                .Where(cd => idCategories.Contains(cd.id_category))
                .AsNoTracking()
                .GroupBy(cd => cd.id_manga)
                .Where(g => g.Count() == idCategories.Count)
                .Select(g => g.Key)
                .Distinct()
                .ToListAsync();
            return Results.Ok(mangaIds);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving manga IDs by categories. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> AddCategoryDetails(
        List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            if (idCategories.Count < 2) return Results.BadRequest("Invalid category list.");

            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var categoryDetailsList = idCategories
                .Select(idCategory => new CategoryDetails { id_manga = idManga, id_category = idCategory })
                .ToList();

            await dbContext.AddRangeAsync(categoryDetailsList);
            await dbContext.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while adding category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> UpdateCategoryDetails(
        List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var existingCategories = await dbContext.Category_details
                .Where(details => details.id_manga == idManga)
                .ToListAsync();

            var oldCategoryIds = existingCategories.Select(c => c.id_category).ToList();

            var categoriesToRemove = existingCategories.Where(c => !idCategories.Contains(c.id_category)).ToList();
            if (categoriesToRemove.Count != 0) dbContext.Category_details.RemoveRange(categoriesToRemove);

            var categoriesToAdd = idCategories.Except(oldCategoryIds)
                .Select(idCategory => new CategoryDetails { id_manga = idManga, id_category = idCategory })
                .ToList();
            if (categoriesToAdd.Count != 0) dbContext.Category_details.AddRange(categoriesToAdd);

            await dbContext.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while updating category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> DeleteCategoryDetailsByManga(
        CategoryDbContext dbContext, [FromBody] List<int> idCategories)
    {
        try
        {
            if (idCategories.Count == 0) return Results.BadRequest("Invalid category list.");

            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var categoriesToDelete = await dbContext.Category_details
                .Where(cd => cd.id_manga == idManga && idCategories.Contains(cd.id_category))
                .ToListAsync();

            if (categoriesToDelete.Count == 0)
                return Results.NotFound(new { Message = "No categories found for deletion." });

            dbContext.Category_details.RemoveRange(categoriesToDelete);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { Message = "Categories deleted successfully" });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while deleting category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }
}