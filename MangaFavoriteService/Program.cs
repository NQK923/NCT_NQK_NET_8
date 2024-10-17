using MangaFavoriteService.Data;
using MangaFavoriteService.Model;
using Microsoft.EntityFrameworkCore;

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
builder.Services.AddDbContext<MangaFavoriteDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/api/mangas/favorite", async (int idAccount, MangaFavoriteDbContext dbContext) =>
{
    var favorites = await dbContext.Manga_Favorite
        .Where(favorite => favorite.id_account == idAccount && favorite.is_favorite).ToListAsync();
    return Results.Ok(favorites);
});

app.MapGet("/api/mangas/isFavorite", async (int idAccount, int idManga, MangaFavoriteDbContext dbContext) =>
{
    var favorite = await dbContext.Manga_Favorite
        .FirstOrDefaultAsync(f => f.id_account == idAccount && f.id_manga == idManga);
    return favorite is { is_favorite: true };
});

app.MapGet("/api/mangas/toggleNotification", async (int idAccount, int idManga, MangaFavoriteDbContext dbContext) =>
{
    var favorite = await dbContext.Manga_Favorite
        .FirstOrDefaultAsync(f => f.id_account == idAccount && f.id_manga == idManga);
    favorite.is_notification = !favorite.is_notification;
    await dbContext.SaveChangesAsync();
    return Results.Ok(favorite);
});

app.MapPost("/api/mangas/favorite/toggle", async (int idAccount, int idManga, MangaFavoriteDbContext dbContext) =>
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
        favorite = new MangaFavorite
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
});

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");

//nguyen
app.MapGet("/api/mangafavorite", async (MangaFavoriteDbContext dbContext) =>
{
    var mangaFavorites = await dbContext.Manga_Favorite.ToListAsync();
    return Results.Ok(mangaFavorites);
});
app.MapPost("/api/mangafavorite",
    async (MangaFavorite mangaFavorite, MangaFavoriteDbContext dbContext) =>
    {
        var exists = await dbContext.Manga_Favorite
            .AnyAsync(m => m.id_account == mangaFavorite.id_account && m.id_manga == mangaFavorite.id_manga);
        if (exists) return Results.Conflict("MangaFavorite already exists.");

        dbContext.Manga_Favorite.Add(mangaFavorite);
        await dbContext.SaveChangesAsync();
        return Results.Ok(mangaFavorite);
    });
app.MapPut("/api/mangafavorite", async (MangaFavorite comment, MangaFavoriteDbContext dbContext) =>
{
    try
    {
        dbContext.Manga_Favorite.Update(comment);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

app.Run();