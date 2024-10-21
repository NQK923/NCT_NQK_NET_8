import {Component, OnInit} from '@angular/core';
import {combineLatest} from "rxjs";
import {Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/manga.service";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";


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
  viewsByDay: number;
  viewsByWeek: number;
  viewsByMonth: number;
  rated_num: number
}

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.css']
})
export class RankComponent implements OnInit {
  mangas: Manga[] = [];
  selectedOption: string = 'rating';
  constructor(private router: Router, private mangaService: MangaService, private mangaViewHistoryService: MangaViewHistoryService) {
  }
  ngOnInit(): void {
    this.loadMangas();
  }
  loadMangas() {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;

      const observables = this.mangas.map(manga =>
        combineLatest([
          this.mangaViewHistoryService.getAllView(manga.id_manga),
          this.mangaViewHistoryService.getViewByDay(manga.id_manga),
          this.mangaViewHistoryService.getViewByWeek(manga.id_manga),
          this.mangaViewHistoryService.getViewByMonth(manga.id_manga),
        ])
      );
      combineLatest(observables).subscribe(results => {
        results.forEach((result, index) => {
          this.mangas[index].totalViews = result[0];
          this.mangas[index].viewsByDay = result[1];
          this.mangas[index].viewsByWeek = result[2];
          this.mangas[index].viewsByMonth = result[3];
        });

        this.sortMangas(this.selectedOption);
      });
    });
  }
  sortMangas(option: string) {
    this.selectedOption = option;
    switch (option) {
      case 'rating':
        this.mangas.sort((a, b) => b.rating - a.rating);
        break;
      case 'day':
        this.mangas.sort((a, b) => b.viewsByDay - a.viewsByDay);
        break;
      case 'week':
        this.mangas.sort((a, b) => b.viewsByWeek - a.viewsByWeek);
        break;
      case 'month':
        this.mangas.sort((a, b) => b.viewsByMonth - a.viewsByMonth);
        break;
    }
  }
  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }
}
