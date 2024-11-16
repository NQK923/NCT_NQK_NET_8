using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.Data;

public class MangaDbContext(DbContextOptions<MangaDbContext> options) : DbContext(options)
{
    public DbSet<Manga> Manga { get; init; }
    public DbSet<Manga_History> Manga_History { get; init; }
    public DbSet<Manga_Favorite> Manga_Favorite { get; init; }
    public DbSet<MangaViewHistories> MangaViewHistory { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Manga_Favorite>().HasKey(mf => new { mf.id_manga, mf.id_account });
        modelBuilder.Entity<Manga_History>().HasKey(mh => new { mh.id_manga, mh.id_account });
        modelBuilder.Entity<MangaViewHistories>().HasKey(mvh => new { mvh.id_manga, mvh.time });
    }
}