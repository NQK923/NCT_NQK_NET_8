﻿using MangaFavoriteService.Model;
using Microsoft.EntityFrameworkCore;

namespace MangaFavoriteService.Data;

public class MangaFavoriteDbContext : DbContext
{
    public MangaFavoriteDbContext(DbContextOptions<MangaFavoriteDbContext> options) : base(options)
    {
    }

    public DbSet<MangaFavorite> Manga_Favorite { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MangaFavorite>()
            .HasKey(favorite => new { favorite.id_manga, favorite.id_account });
    }
}