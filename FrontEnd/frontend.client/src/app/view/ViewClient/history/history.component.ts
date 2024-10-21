import {Component, OnInit} from '@angular/core';
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaService} from "../../../service/Manga/manga.service";
import {Router} from "@angular/router";

interface History {
  id_account: number;
  id_manga: number;
  index_chapter: number;
  time: Date;
}

interface Manga {
  id_manga: number;
  name: string;
  author: string;
  num_of_chapter: number;
  rating: number;
  id_account: number;
  is_posted: boolean;
  cover_img: string;
  describe: string;
  updated_at: Date;
  totalViews: number
  rated_num: number;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  histories: History[] = [];
  mangas: Manga[] = [];
  combinedHistories: { history: History, manga: Manga }[] = [];

  constructor(private router: Router, private mangaHistoryService: MangaHistoryService, private mangaService: MangaService) {
  }

  ngOnInit(): void {
    const id_user = localStorage.getItem('userId');
    let numberId: number = Number(id_user);
    this.mangaHistoryService.getSimpleHistory(numberId).subscribe((data: History[]) => {
      this.histories = data;
      this.getMangaDetails();
    }, (error) => {
      console.log(error);
    });
  }

  getMangaDetails(): void {
    this.combinedHistories = [];
    for (let history of this.histories) {
      this.mangaService.getMangaById(history.id_manga).subscribe((manga: Manga) => {
        this.combinedHistories.push({history, manga});
      }, (error) => {
        console.error(`Failed to load manga with id: ${history.id_manga}`, error);
      });
    }
  }

  confirmDelete(id_account: number, id_manga: number): void {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa lịch sử đọc này không?");
    if (confirmed) {
      this.deleteMangaHistory(id_account, id_manga);
    }
  }

  deleteMangaHistory(id_account: number, id_manga: number): void {
    this.mangaHistoryService.deleteMangaHistory(id_account, id_manga)
      .subscribe({
        next: (response) => {
          window.location.reload();
        },
        error: (error) => {
          console.error("Failed to delete manga history:", error);
        }
      });
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }
}
