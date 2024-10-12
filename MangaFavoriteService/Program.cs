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
app.Run();