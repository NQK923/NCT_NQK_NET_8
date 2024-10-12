using CategoryDetailsService.Data;
using CategoryDetailsService.Model;
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
    var categories = await dbContext.Category_details.ToListAsync();
    return Results.Ok(categories);
});

app.MapGet("/api/category_details/{id_manga}", async (int id_manga, CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.Category_details.Where(details => details.id_manga == id_manga).ToListAsync();
    return Results.Ok(categories);
});

app.MapPost("/api/add_manga_category",
    async (List<int> id_categories, CategoryDetailsDbContext dbContext) =>
    {
        if (id_categories.Count < 2) return Results.BadRequest("Invalid category list.");

        var categoryDetailsList = new List<Category_details>();
        var idManga = id_categories[0];
        id_categories.RemoveAt(0);
        for (var i = 0; i < id_categories.Count; i++)
        {
            var cd = new Category_details
            {
                id_manga = idManga,
                id_category = id_categories[i]
            };
            categoryDetailsList.Add(cd);
        }

        await dbContext.AddRangeAsync(categoryDetailsList);
        await dbContext.SaveChangesAsync();

        return Results.Ok();
    });


app.MapPut("/api/update_manga_category",
    async (List<int> id_categories, CategoryDetailsDbContext dbContext) =>
    {
        var id_manga = id_categories[0];
        var categories = await dbContext.Category_details.Where(details => details.id_manga == id_manga).ToListAsync();
        var old_id = categories.Select(c => c.id_category).ToList();

        var categoriesToRemove = categories.Where(c => !id_categories.Contains(c.id_category)).ToList();
        if (categoriesToRemove.Count != 0) dbContext.Category_details.RemoveRange(categoriesToRemove);

        var categoriesToAdd = id_categories.Except(old_id).Select(id_category => new Category_details
        {
            id_manga = id_manga,
            id_category = id_category
        }).ToList();

        if (categoriesToAdd.Count != 0) dbContext.Category_details.AddRange(categoriesToAdd);

        await dbContext.SaveChangesAsync();

        return Results.Ok();
    });


app.UseCors("AllowAllOrigins");
app.Run();