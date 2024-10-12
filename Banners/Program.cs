using Banner.Data;
using Banners.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<BannerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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


app.MapGet("/api/banner", async (BannerDbContext dbContext) =>
{
    var banners = await dbContext.Banner.ToListAsync();
    return Results.Ok(banners);
});


app.MapPost("/api/banner", async (ModelBanner banner, BannerDbContext dbContext) =>
{
    try
    {
        dbContext.Banner.Add(banner);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Ok(false);
    }
});

app.MapDelete("/api/banner/{id}", async (int id, BannerDbContext dbContext) =>
{
    var banner = await dbContext.Banner.FindAsync(id);
    if (banner == null) return Results.NotFound();

    dbContext.Banner.Remove(banner);
    await dbContext.SaveChangesAsync();
    return Results.Ok(true);
});

app.Run();