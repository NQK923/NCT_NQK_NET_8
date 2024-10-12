import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {MangaHistoryService} from "../../../service/MangaHistory/manga_history.service";
import {MangaDetailsService} from "../../../service/Manga/manga_details.service";

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
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  histories: History[] = [];
  mangas: Manga[] = [];
  combinedHistories: { history: History, manga: Manga }[] = [];

  constructor(private http: HttpClient, private mangaHistoryService: MangaHistoryService, private mangaService: MangaDetailsService) {
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
        console.log(`Failed to load manga with id: ${history.id_manga}`, error);
      });
    }
  }


}
