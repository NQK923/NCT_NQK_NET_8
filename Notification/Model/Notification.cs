namespace Notification.Model;

public class Notification
{
    public int Id_Notification { get; set; }
    public string Content { get; set; }
    public DateTime Time { get; set; }
    public bool IsRead { get; set; }
    public string Type_Noti { get; set; }
}

public class NotificationMangaAccount
{
    public int Id_Notification { get; set; }
    public int Id_manga { get; set; }
    public int Id_account { get; set; }
    public bool IsGotNotification { get; set; }
    public bool is_read { get; set; }
}