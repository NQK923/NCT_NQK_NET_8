using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Data;
using Notification.Model;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<InfoAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

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

app.MapGet("/api/infoaccount", async ([FromServices] InfoAccountDbContext dbContext) =>
{
    var infoAccount = await dbContext.InfoAccounts.ToListAsync();
    return Results.Ok(infoAccount);
});

app.Run();