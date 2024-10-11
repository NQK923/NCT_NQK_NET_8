namespace Notification.Model;

public class ModelMangaFavorte
{
    public int id_manga { get; set; }
    public int id_account { get; set; } // Đặt tên theo chuẩn PascalCase
    public Boolean? is_favorite { get; set; }
   
}