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

// get manga history by id account
app.MapGet("/api/mangas/history/{idAccount:int}", async (int idAccount, int idManga, MangaHistoryDbContext dbContext) =>
{
    var histories = await dbContext.Manga_History
        .Where(history => history.id_account == idAccount && idManga == history.id_manga).ToListAsync();
    return Results.Ok(histories);
});

//get latest manga history 
app.MapGet("/api/mangas/simple_history/{idAccount:int}", async (int idAccount, MangaHistoryDbContext dbContext) =>
{
    var recentHistories = await dbContext.Manga_History
        .Where(history => history.id_account == idAccount)
        .GroupBy(history => history.id_manga)
        .Select(group => group.OrderByDescending(history => history.time).FirstOrDefault())
        .ToListAsync();

    return Results.Ok(recentHistories);
});

//add manga history
app.MapPost("api/mangas/create/history",
    async (MangaHistoryRequest request, MangaHistoryDbContext dbContext) =>
    {
        var existingHistory = await dbContext.Manga_History
            .FirstOrDefaultAsync(h =>
                h.id_account == request.id_account && h.id_manga == request.id_manga &&
                h.index_chapter == request.index_chapter);

        if (existingHistory != null)
        {
            existingHistory.time = DateTime.Now;
            dbContext.Manga_History.Update(existingHistory);
        }
        else
        {
            var newHistory = new MangaHistory
            {
                id_account = request.id_account,
                id_manga = request.id_manga,
                index_chapter = request.index_chapter,
                time = DateTime.Now
            };
            await dbContext.Manga_History.AddAsync(newHistory);
        }

        await dbContext.SaveChangesAsync();
        return Results.Ok();
    });

//delete manga history by id account and manga id
app.MapDelete("api/mangas/delete/{idAccount:int}/{idManga:int}",
    async (int idAccount, int idManga, MangaHistoryDbContext dbContext) =>
    {
        var existingHistory = await dbContext.Manga_History
            .FirstOrDefaultAsync(h => h.id_account == idAccount &&
                                      h.id_manga == idManga);
        if (existingHistory != null)
        {
            dbContext.Manga_History.Remove(existingHistory);
            await dbContext.SaveChangesAsync();
            return Results.Ok();
        }

        return Results.NotFound(new { message = "History record not found." });
    });


app.UseHttpsRedirection();

app.UseCors("AllowAllOrigins");
app.Run();