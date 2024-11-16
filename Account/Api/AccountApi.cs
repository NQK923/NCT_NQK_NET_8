using Account.Data;
using Account.Email;
using Microsoft.EntityFrameworkCore;

namespace Account.Api;

public static class AccountApi
{
    public static void MapAccountEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/Account", GetAllAccounts);
        app.MapGet("/api/Account/data", GetAccountById);
        app.MapGet("/api/AccountById/{idAccount:int}", GetAccountByIdRoute);
        app.MapPost("/api/Account", AddNewAccount);
        app.MapPost("/api/Login", Login);
        app.MapPost("/api/password", ForgotPassword);
        app.MapPut("/api/Account", UpdateAccount);
    }

    private static async Task<IResult> GetAllAccounts(AccountDbContext dbContext)
    {
        var accounts = await dbContext.Account.ToListAsync();
        return Results.Ok(accounts);
    }

    private static async Task<IResult> GetAccountById(int idAccount, AccountDbContext dbContext)
    {
        var account = await dbContext.Account
            .Where(ac => ac.id_account == idAccount)
            .FirstOrDefaultAsync();

        return Results.Ok(account);
    }

    private static async Task<IResult> GetAccountByIdRoute(AccountDbContext dbContext, int idAccount)
    {
        var account = await dbContext.Account.FindAsync(idAccount);
        return account == null ? Results.NotFound() : Results.Ok(account);
    }

    private static async Task<IResult> AddNewAccount(Model.Account account, AccountDbContext dbContext)
    {
        try
        {
            var exists = await dbContext.Account
                .AnyAsync(m => m.username == account.username);

            if (exists) return Results.Ok(false);

            dbContext.Account.Add(account);
            await dbContext.SaveChangesAsync();
            return Results.Ok(account.id_account);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred during account creation: " + ex.Message);
        }
    }

    private static async Task<IResult> Login(Model.Account account, AccountDbContext dbContext)
    {
        try
        {
            var existingAccount = await dbContext.Account
                .FirstOrDefaultAsync(a => a.username == account.username && a.password == account.password);

            return existingAccount != null
                ? Results.Ok(existingAccount.id_account)
                : Results.NotFound("Invalid username or password");
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred during the login process: " + ex.Message);
        }
    }

    private static async Task<IResult> ForgotPassword(string email, string title, string text)
    {
        var result = await AddMail.SendMail("manganctnqk@gmail.com", email, title, text);
        return Results.Ok(result == "success");
    }

    private static async Task<IResult> UpdateAccount(Model.Account updatedAccount, AccountDbContext dbContext)
    {
        try
        {
            var existingAccount = await dbContext.Account
                .FirstOrDefaultAsync(m => m.id_account == updatedAccount.id_account);

            if (existingAccount == null) return Results.NotFound("Tài khoản không tồn tại.");

            existingAccount.status = updatedAccount.status;
            existingAccount.password = updatedAccount.password;
            existingAccount.banComment = updatedAccount.banComment;
            await dbContext.SaveChangesAsync();

            return Results.Ok(existingAccount);
        }
        catch (Exception ex)
        {
            return Results.Problem("Đã xảy ra lỗi trong quá trình cập nhật tài khoản: " + ex.Message);
        }
    }
}