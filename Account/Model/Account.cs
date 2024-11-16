namespace Account.Model;

public class Account
{
    public int? id_account { get; set; }
    public string username { get; set; }
    public string password { get; set; }
    public DateTime? banDate { get; set; }
    public bool? role { get; set; }
    public bool? status { get; set; }
    public bool? banComment { get; set; }
}

public class InfoAccount
{
    public int id_account { get; set; }
    public string? name { get; set; }
    public string? email { get; set; }
    public string? cover_img { get; set; }
}