using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Banners.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình DbContext cho Azure SQL
builder.Services.AddDbContext<AccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddDbContext<InfoAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware cho Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Middleware cho HTTPS và CORS
app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// Endpoint để lấy thông tin tài khoản
app.MapGet("/api/InfoAccount", async ([FromServices] InfoAccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});

// Endpoint để thêm thông tin tài khoản
app.MapPost("/api/InfoAccount", async (ModelInfoAccount infoAccount, [FromServices] InfoAccountDbContext dbContext) =>
{
    try
    {
        dbContext.Account.Add(infoAccount);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred while saving the account: " + ex.Message);
    }
});

// Endpoint để cập nhật avatar
app.MapPost("/api/InfoAccountavata", async (HttpRequest request, [FromServices] InfoAccountDbContext db) =>
{
    // Kiểm tra Content-Type
    if (!request.HasFormContentType)
    {
        return Results.BadRequest("Content-Type must be multipart/form-data");
    }

    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var idString = formCollection["id"];

    if (!int.TryParse(idString, out int id))
    {
        return Results.BadRequest("Invalid ID format");
    }

    if (file == null || file.Length == 0)
        return Results.BadRequest("No file uploaded");

    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
    await blobContainerClient.CreateIfNotExistsAsync(); // Tạo container nếu chưa tồn tại

    var blobClient = blobContainerClient.GetBlobClient($"{id}/{file.FileName}");

    await using var stream = file.OpenReadStream();
    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

    var coverImgUrl = blobClient.Uri.ToString();
    var existingAccount = await db.Account.FindAsync(id);

    if (existingAccount == null)
    {
        return Results.NotFound("Account not found");
    }

    existingAccount.cover_img = coverImgUrl; // Cập nhật hình ảnh
    db.Account.Update(existingAccount);
    await db.SaveChangesAsync();

    return Results.Ok(true);
});

// Endpoint để lấy thông tin tài khoản
app.MapGet("/api/Account", async ([FromServices] AccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});

// Endpoint để thêm tài khoản
app.MapPost("/api/Account", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        dbContext.Account.Add(account);
        await dbContext.SaveChangesAsync();
        return Results.Ok(account.id_account);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

// Endpoint để đăng nhập
app.MapPost("/api/Login", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var existingAccount = await dbContext.Account
            .FirstOrDefaultAsync(a => a.username == account.username && a.password == account.password);

        if (existingAccount != null)
            return Results.Ok(existingAccount.id_account);

        return Results.NotFound("Invalid username or password");
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during the login process: " + ex.Message);
    }
});

// Chạy ứng dụng
app.Run();