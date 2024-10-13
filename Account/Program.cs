using Banners.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Account.Email;
var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
        policyBuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
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

app.MapGet("/api/Account", async ([FromServices] AccountDbContext dbContext) =>
{
    var accounts = await dbContext.Account.ToListAsync();
    return Results.Ok(accounts);
});


app.MapPost("/api/Account", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var exists = await dbContext.Account
            .AnyAsync(m => m.id_account == account.id_account); 
        if (exists)
        {
            return Results.Ok(false);
        }
        dbContext.Account.Add(account);
        await dbContext.SaveChangesAsync();
        return Results.Ok(account.id_account);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

app.MapPut("/api/Account", async ( ModelAccount updatedAccount, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var existingAccount = await dbContext.Account
            .FirstOrDefaultAsync(m => m.id_account == updatedAccount.id_account);

        if (existingAccount == null)
        {
            return Results.NotFound("Account not found.");
        }
        dbContext.Update(updatedAccount);
        await dbContext.SaveChangesAsync();
        return Results.Ok(existingAccount);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account update: " + ex.Message);
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

        return Results.NotFound("Invalid username or password");
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during the login process: " + ex.Message);
    }
});
app.MapGet("/test", async () =>
{
    var result = await AddMail.SendMail("nct@gmail.com", "nguyennrdz@gmail.com", "text", "hello");
    return Results.Ok(result == "success" ? "Email đã được gửi thành công." : result);
});
app.Run();