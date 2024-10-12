// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Data;

public class InfoAccountDbContext : DbContext
{
    public InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : base(options)
    {
    }

    public DbSet<ModelinfoAccount> InfoAccounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelinfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<ModelinfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
    }
}