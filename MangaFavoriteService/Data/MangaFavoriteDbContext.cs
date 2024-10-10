using MangaFavoriteService.Model;
using Microsoft.EntityFrameworkCore;

namespace MangaFavoriteService.Data;

public class MangaFavoriteDbContext : DbContext
{
    public MangaFavoriteDbContext(DbContextOptions<MangaFavoriteDbContext> options) : base(options) { }
    public DbSet<MangaFavorite> MangaFavorites { get; set; }
}