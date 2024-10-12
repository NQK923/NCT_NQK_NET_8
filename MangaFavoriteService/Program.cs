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
    var histories = await dbContext.Manga_Favorite
        .Where(favorite => favorite.id_account == idAccount && favorite.is_favorite).ToListAsync();
    return Results.Ok(histories);
});

app.MapPost("api/mangas/create/favorite",
    async (int idAccount, int idManga, MangaFavoriteDbContext dbContext) =>
    {
        var favorite = new MangaFavorite
        {
            id_account = idAccount,
            id_manga = idManga,
            is_favorite = true
        };
        return await dbContext.Manga_Favorite.AddAsync(favorite);
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