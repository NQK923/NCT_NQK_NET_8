using System.ComponentModel.DataAnnotations;

namespace CategoryService.Model;

public class Category
{
    [Key] public int id_category { get; init; }

    public string name { get; init; }
    public string description { get; init; }
}

public class CategoryDetails
{
    public int id_category { get; set; }

    public int id_manga { get; set; }
}