using CategoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Data;

public class CategoryDbContext(DbContextOptions<CategoryDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories { get; init; }

    public DbSet<CategoryDetails> Category_details { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CategoryDetails>()
            .HasKey(cd => new { cd.id_manga, cd.id_category });

        base.OnModelCreating(modelBuilder);
    }
}