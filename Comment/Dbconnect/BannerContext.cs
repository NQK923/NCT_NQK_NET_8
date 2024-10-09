// Data/CommentDbContext.cs

using Comment.Model;
using Microsoft.EntityFrameworkCore;

namespace Comment.Data;

public class CommentDbContext : DbContext
{
    public CommentDbContext(DbContextOptions<CommentDbContext> options) : base(options)
    {
    }

    public DbSet<ModelComment> Comment { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelComment>()
            .ToTable("Comment")
            .HasKey(n => n.id_comment); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelComment>()
            .Property(n => n.id_comment)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdComment
    }
}