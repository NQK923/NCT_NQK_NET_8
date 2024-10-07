// Data/AccountDbContext.cs

using Banners.Model;
using Microsoft.EntityFrameworkCore;

public class AccountDbContext : DbContext
{
    public AccountDbContext(DbContextOptions<AccountDbContext> options) : base(options)
    {
    }

    public DbSet<ModelAccount> Account { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelAccount>()
            .ToTable("Account")
            .HasKey(n => n.id_account); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdAccount
    }
}

public class InfoAccountDbContext : DbContext
{
    public InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : base(options)
    {
    }

    public DbSet<ModelInfoAccount> Account { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelInfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelInfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdAccount
    }
}