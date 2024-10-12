using Banners.Model;
using Microsoft.EntityFrameworkCore;

public class AccountDbContext : DbContext
{
    public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options)
    {
    }

    public DbSet<ModelAccount> Account { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelAccount>()
            .ToTable("Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<ModelAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
    }
}