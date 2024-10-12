using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Data;
using Notification.Model;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<NotificationMangaAccountDbContext>(options =>
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
app.MapGet("/api/notificationMangAccount", async (NotificationMangaAccountDbContext dbContext) =>
{
    var notificationMangaAccount = await dbContext.NotificationMangaAccounts.ToListAsync();
    return Results.Ok(notificationMangaAccount);
});
app.MapPost("/api/notificationMangAccount",
    async (ModelNotificationMangaAccount notification, [FromServices] NotificationMangaAccountDbContext dbContext) =>
    {
        dbContext.NotificationMangaAccounts.Add(notification);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
    });
app.MapPut("/api/notificationMangAccount", async (ModelNotificationMangaAccount notification,
    [FromServices] NotificationMangaAccountDbContext dbContext) =>
{
    try
    {
        dbContext.NotificationMangaAccounts.Update(notification);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

app.Run();