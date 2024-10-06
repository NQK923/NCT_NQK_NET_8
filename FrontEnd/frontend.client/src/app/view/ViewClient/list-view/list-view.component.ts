import {Component, OnInit} from '@angular/core';
import {combineLatest, forkJoin, map} from "rxjs";
import {Router} from "@angular/router";
import {MangaService} from "../../../service/Manga/get_manga.service";
import {ChapterService} from "../../../service/Chapter/get_chapter.service";
import {BannerService} from "../../../service/Banner/banner.service";


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
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.css']
})

export class ListViewComponent implements OnInit {
  selectedValue: string = '';
  mangas: Manga[] = [];

  constructor(private router: Router, private mangaService: MangaService, private chapterService: ChapterService) {
  }

  ngOnInit(): void {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        this.chapterService.getTotalViewsByMangaId(manga.id_manga)
      );
      combineLatest(observables).subscribe(results => {
        results.forEach((result, index) => {
          this.mangas[index].totalViews = result.totalViews;
          console.log(this.mangas[index].totalViews);
        });
      });
    });
  }

  onSelectionChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedValue = target.value;
  }

  isVisible(option: string): boolean {
    return this.selectedValue === option;
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }
}
