using MangaViewHistoryService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaViewHistoryService.Data;

public class MangaViewHistoryDbContext : DbContext
{
    public DbSet<MangaViewHistories> MangaViewHistory { get; set; }
}