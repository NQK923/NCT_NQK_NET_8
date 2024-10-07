using Banners.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddDbContext<InfoAccountDbContext>(options =>
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


app.MapGet("/api/InfoAccount", async ([FromServices] InfoAccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});


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
        return Results.Ok(false);
    }
});


app.MapGet("/api/Account", async ([FromServices] AccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});
app.MapPost("/api/Account", async (ModelAccount Account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        dbContext.Account.Add(Account);
        await dbContext.SaveChangesAsync();
        return Results.Ok(Account.id_account);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during the login process.");
    }
});

app.MapPost("/api/Login", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var existingAccount = await dbContext.Account
            .FirstOrDefaultAsync(a => a.username == account.username && a.password == account.password);
        if (existingAccount != null)
            return Results.Ok(existingAccount.id_account);
        return Results.Ok(false);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during the login process.");
    }
});


app.Run();