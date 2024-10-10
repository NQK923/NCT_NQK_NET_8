namespace MangaHistoryService.Model;

public class MangaHistory
{
    public int id_account { get; set; }
    public int id_manga { get; set; }
    public int id_chap { get; set; }
    public DateTime time { get; set; }
}