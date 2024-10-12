using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Data;
using Notification.Model;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình DbContext cho Notification
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));
builder.Services.AddDbContext<MangaFavorteDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Cấu hình DbContext cho Notification
builder.Services.AddDbContext<NotificationMangaAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


// Cấu hình DbContext cho InfoAccount
builder.Services.AddDbContext<InfoAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));
builder.Services.AddDbContext<MangaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));
// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cấu hình Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
// // Định nghĩa điểm cuối API để lấy danh sách thông báo
// app.MapGet("/api/notificationMangAccount", async (NotificationMangaAccountDbContext dbContext) =>
// {
//     var notificationMangaAccount = await dbContext.NotificationMangaAccounts.ToListAsync();
//     return Results.Ok(notificationMangaAccount);
// });
// app.MapPost("/api/notificationMangAccount",
//     async (ModelNotificationMangaAccount notification, [FromServices] NotificationMangaAccountDbContext dbContext) =>
//     {
//         dbContext.NotificationMangaAccounts.Add(notification);
//         await dbContext.SaveChangesAsync();
//         return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
//     });
// app.MapPut("/api/notificationMangAccount", async (ModelNotificationMangaAccount notification,
//     [FromServices] NotificationMangaAccountDbContext dbContext) =>
// {
//     try
//     {
//         dbContext.NotificationMangaAccounts.Update(notification);
//         await dbContext.SaveChangesAsync();
//         return Results.Ok(true);
//     }
//     catch (Exception ex)
//     {
//         return Results.Problem("An error occurred during account creation: " + ex.Message);
//     }
// });

// // Điểm cuối để lấy danh sách tài khoản
// app.MapGet("/api/infoaccount", async ([FromServices] InfoAccountDbContext dbContext) =>
// {
//     var infoAccount = await dbContext.InfoAccounts.ToListAsync();
//     return Results.Ok(infoAccount);
// });

app.MapGet("/api/notification", async ([FromServices] NotificationDbContext dbContext) =>
{
    var notifications = await dbContext.Notifications.ToListAsync();
    return Results.Ok(notifications);
});
app.MapPost("/api/notification",
    async (ModelNotification notification, [FromServices] NotificationDbContext dbContext) =>
    {
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
    });
// app.MapGet("/api/manga", async ([FromServices] MangaDbContext dbContext) =>
// {
//     var manga = await dbContext.Manga.ToListAsync();
//     return Results.Ok(manga);
// });

// app.MapGet("/api/mangafavorite", async ([FromServices] MangaFavorteDbContext dbContext) =>
// {
//     var mangaFavorites = await dbContext.MangaFavorites.ToListAsync();
//     return Results.Ok(mangaFavorites);
// });
// app.MapPost("/api/mangafavorite",
//     async (ModelMangaFavorte mangafavorite, [FromServices] MangaFavorteDbContext dbContext) =>
//     {
//         dbContext.MangaFavorites.Add(mangafavorite);
//         await dbContext.SaveChangesAsync();
//         return Results.Ok(mangafavorite);
//     });
//
// app.MapPut("/api/mangafavorite", async (ModelMangaFavorte comment, MangaFavorteDbContext dbContext) =>
// {
//     try
//     {
//         dbContext.MangaFavorites.Update(comment);
//         await dbContext.SaveChangesAsync();
//         return Results.Ok(true);
//     }
//     catch (Exception ex)
//     {
//         return Results.Problem("An error occurred during account creation: " + ex.Message);
//     }
// });
app.Run();