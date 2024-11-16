using Account.Model;
using Microsoft.EntityFrameworkCore;

namespace Account.Data;

public class AccountDbContext(DbContextOptions<AccountDbContext> options) : DbContext(options)
{
    public DbSet<Model.Account> Account { get; set; }
    public DbSet<InfoAccount> InfoAccount { get; init; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Model.Account>()
            .ToTable("Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<Model.Account>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
        modelBuilder.Entity<InfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<InfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
    }
}