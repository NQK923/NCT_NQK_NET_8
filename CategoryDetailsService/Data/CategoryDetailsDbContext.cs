using CategoryDetailsService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryDetailsService.Data;

public class CategoryDetailsDbContext(DbContextOptions<CategoryDetailsDbContext> options) : DbContext(options)
{
    public DbSet<CategoryDetails> CategoryDetails { get; init; }
}