using MangaHistoryService.Data;
using MangaHistoryService.Model;
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
builder.Services.AddDbContext<MangaHistoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/api/mangas/history", async (int id_account, MangaHistoryDbContext dbContext) =>
{
    var histories = await dbContext.Manga_History.Where(history => history.id_account == id_account).ToListAsync();
    return Results.Ok(histories);
});

app.MapPost("api/mangas/create/history",
    async (int id_account, int id_manga, int id_chapter, MangaHistoryDbContext dbContext) =>
    {
        var history = new MangaHistory
        {
            id_account = id_account,
            id_manga = id_manga,
            id_chap = id_chapter,
            time = DateTime.Now
        };
        return await dbContext.Manga_History.AddAsync(history);
    });

app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");
app.Run();