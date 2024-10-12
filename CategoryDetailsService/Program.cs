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

app.MapGet("/api/category_details/{idManga}", async (int idManga, CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.Category_details.Where(details => details.id_manga == idManga).ToListAsync();
    return Results.Ok(categories);
});

app.MapPost("/api/add_manga_category",
    async (List<int> idCategories, CategoryDetailsDbContext dbContext) =>
    {
        if (idCategories.Count < 2) return Results.BadRequest("Invalid category list.");

        var idManga = idCategories[0];
        idCategories.RemoveAt(0);
        Console.WriteLine("Test: " + idCategories[0] + ", idManga: " + idManga);
        var categoryDetailsList = idCategories.Select(t => new Category_details { id_manga = idManga, id_category = t })
            .ToList();
        await dbContext.AddRangeAsync(categoryDetailsList);
        await dbContext.SaveChangesAsync();
        return Results.Ok();
    });


app.MapPut("/api/update_manga_category",
    async (List<int> idCategories, CategoryDetailsDbContext dbContext) =>
    {
        var idManga = idCategories[0];
        idCategories.RemoveAt(0);
        Console.WriteLine("Test: " + idManga);
        var categories = await dbContext.Category_details.Where(details => details.id_manga == idManga).ToListAsync();
        var oldId = categories.Select(c => c.id_category).ToList();

        var categoriesToRemove = categories.Where(c => !idCategories.Contains(c.id_category)).ToList();
        if (categoriesToRemove.Count != 0) dbContext.Category_details.RemoveRange(categoriesToRemove);

        var categoriesToAdd = idCategories.Except(oldId).Select(idCategory => new Category_details
        {
            id_manga = idManga,
            id_category = idCategory
        }).ToList();

        if (categoriesToAdd.Count != 0) dbContext.Category_details.AddRange(categoriesToAdd);

        await dbContext.SaveChangesAsync();

        return Results.Ok();
    });


app.UseCors("AllowAllOrigins");
app.Run();