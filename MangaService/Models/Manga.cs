﻿using System.ComponentModel.DataAnnotations;

namespace MangaService.Models;

public class Manga
{
    [Key] public int id_manga { get; set; }

    public string name { get; set; }
    public string author { get; set; }
    public int num_of_chapter { get; set; }
    public double rating { get; set; }
    public int id_account { get; set; }
    public bool is_posted { get; set; }
    public string cover_img { get; set; }
    public string describe { get; set; }
    public DateTime updated_at { get; set; }
    public bool is_deleted { get; set; }
    public int rated_num { get; set; }
}

public class Manga_History
{
    public int id_account { get; set; }
    public int id_manga { get; set; }
    public int index_chapter { get; set; }
    public DateTime time { get; set; }
}

public class Manga_Favorite
{
    public int id_manga { get; set; }
    public int id_account { get; set; }
    public bool is_favorite { get; set; }

    public bool is_notification { get; set; }
}

public class MangaViewHistories
{
    [Key] public int id_manga { get; set; }

    public DateTime time { get; set; }
}