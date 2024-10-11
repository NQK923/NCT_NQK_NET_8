using MangaHistoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace MangaHistoryService.Data;

public class MangaHistoryDbContext : DbContext
{
    public MangaHistoryDbContext(DbContextOptions<MangaHistoryDbContext> options) : base(options)
    {
    }

    public DbSet<MangaHistory> Manga_History { get; init; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MangaHistory>()
            .HasNoKey();
    }
}