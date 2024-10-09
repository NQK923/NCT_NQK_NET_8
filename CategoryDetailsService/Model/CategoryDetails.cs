using System.ComponentModel.DataAnnotations;

namespace CategoryDetailsService.Model;

public class CategoryDetails
{
    [Key]
    public int id_category { get; set; }
    [Key]
    public int id_manga { get; set; }
}