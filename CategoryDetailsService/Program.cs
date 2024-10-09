using CategoryDetailsService.Data;
using CategoryDetailsService.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<CategoryDetailsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/category_details", async (CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.CategoryDetails.ToListAsync();
    return Results.Ok(categories);
});

app.MapGet("/api/category_details/{id_manga}", async (int id_manga, CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.CategoryDetails.Where(details => details.id_manga == id_manga).ToListAsync();
    return Results.Ok(categories);
});

app.MapPost("/api/add_manga_category",
    async (int id_manga, List<int> id_categories, CategoryDetailsDbContext dbContext) =>
    {
        foreach (var categoryDetails in id_categories.Select(category => new CategoryDetails
                 {
                     id_manga = id_manga,
                     id_category = category
                 }))
        {
            dbContext.Add(categoryDetails);
            await dbContext.SaveChangesAsync();
        }

        return Results.Ok();
    });
app.MapPost("/api/update_manga_category",
    async (int id_manga, List<int> id_categories, CategoryDetailsDbContext dbContext) =>
    {
        var categories = await dbContext.CategoryDetails.Where(details => details.id_manga == id_manga).ToListAsync();
        var old_id = new List<int>();
        foreach (var category in categories)
        {
            if (!id_categories.Contains(category.id_category))
            {
                var categoryDetails = new CategoryDetails
                {
                    id_manga = id_manga,
                    id_category = category.id_category
                };
                dbContext.Remove(categoryDetails);
                await dbContext.SaveChangesAsync();
            }

            old_id.Add(category.id_category);
        }

        foreach (var categoryDetails in from category in id_categories
                 where !old_id.Contains(category)
                 select new CategoryDetails
                 {
                     id_manga = id_manga,
                     id_category = category
                 })
        {
            dbContext.Add(categoryDetails);
            await dbContext.SaveChangesAsync();
        }

        return Results.Ok();
    });

app.UseCors("AllowAllOrigins");
app.Run();