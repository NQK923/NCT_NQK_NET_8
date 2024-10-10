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

app.MapGet("/api/mangas/favorite", async (int id_account, MangaFavoriteDbContext dbContext) =>
{
    var histories = await dbContext.Manga_Favorite
        .Where(favorite => favorite.id_account == id_account && favorite.is_favorite).ToListAsync();
    return Results.Ok(histories);
});

app.MapPost("api/mangas/create/favotite",
    async (int id_account, int id_manga, MangaFavoriteDbContext dbContext) =>
    {
        var favorite = new MangaFavorite
        {
            id_account = id_account,
            id_manga = id_manga,
            is_favorite = true
        };
        return await dbContext.Manga_Favorite.AddAsync(favorite);
    });

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");
app.Run();