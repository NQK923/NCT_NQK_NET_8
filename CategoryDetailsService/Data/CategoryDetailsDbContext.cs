using CategoryDetailsService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryDetailsService.Data;

public class CategoryDetailsDbContext: DbContext
{
    public CategoryDetailsDbContext(DbContextOptions<CategoryDetailsDbContext> options) : base(options) { }
    public DbSet<CategoryDetails> CategoryDetails { get; set; }
}