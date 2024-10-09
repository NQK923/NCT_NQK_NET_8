using CategoryDetailsService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryDetailsService.Data;

public class CategoryDetailsDbContext(DbContextOptions<CategoryDetailsDbContext> options) : DbContext(options)
{
    public DbSet<Category_details> Category_details { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category_details>()
            .HasKey(cd => new { cd.id_category, cd.id_manga });

        base.OnModelCreating(modelBuilder);
    }
}