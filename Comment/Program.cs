using Comment.Data;
using Comment.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure the database context
builder.Services.AddDbContext<CommentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Add services for Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// Define API endpoint to get Comment
app.MapGet("/api/comment", async (CommentDbContext dbContext) =>
{
    var Comment = await dbContext.Comment.ToListAsync();
    return Results.Ok(Comment);
});

// Define API endpoint to add a new banner
app.MapPost("/api/comment", async (ModelComment comment, CommentDbContext dbContext) =>
{
    try
    {
        dbContext.Comment.Add(comment);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Ok(false);
    }
});
app.MapPut("/api/comment", async (ModelComment comment, CommentDbContext dbContext) =>
{
    try
    {
        dbContext.Comment.Update(comment);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});
app.MapDelete("/api/comment/{id}", async (int id, CommentDbContext dbContext) =>
{
    var Comment = await dbContext.Comment.FindAsync(id);
    if (Comment == null) return Results.NotFound();

    dbContext.Comment.Remove(Comment);
    await dbContext.SaveChangesAsync();
    return Results.Ok(true);
});
app.Run();