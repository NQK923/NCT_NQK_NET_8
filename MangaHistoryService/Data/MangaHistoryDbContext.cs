using MangaHistoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace MangaHistoryService.Data;

public class MangaHistoryDbContext : DbContext
{
    public MangaHistoryDbContext(DbContextOptions<MangaHistoryDbContext> options) : base(options)
    {
    }

    public DbSet<MangaHistory> MangaHistory { get; set; }
}