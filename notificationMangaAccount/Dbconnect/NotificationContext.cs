// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Data;

public class NotificationMangaAccountDbContext : DbContext
{
    public NotificationMangaAccountDbContext(DbContextOptions<NotificationMangaAccountDbContext> options) :
        base(options)
    {
    }

    public DbSet<ModelNotificationMangaAccount> NotificationMangaAccounts { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .ToTable("Notification_Manga_Account")
            .HasKey(n => n.Id_Notification); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .Property(n => n.Id_Notification)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdAccount
    }
}
