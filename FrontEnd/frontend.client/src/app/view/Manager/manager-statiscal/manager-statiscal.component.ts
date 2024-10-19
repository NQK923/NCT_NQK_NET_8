import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MangaService} from "../../../service/Manga/manga.service";
import {forkJoin, map} from "rxjs";
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {CategoryDetailModel} from "../../../Model/Category_details";

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
  selector: 'app-manager-statiscal',
  templateUrl: './manager-statiscal.component.html',
  styleUrls: ['./manager-statiscal.component.css']
})

export class ManagerStatiscalComponent implements OnInit {

  mangas: Manga[] = [];
  category: CategoryDetailModel[] = [];
  recentMangas: Manga[] = [];
  totalRead: number = 0;
  numberManga: number = 0;
  top:number=0;

  constructor(private router: Router, private mangaService: MangaService,
              private mangaViewHistoryService: MangaViewHistoryService,
              private  CategoryDetailsService:CategoryDetailsService) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToAccount() {
    this.router.navigate(['/manager-account']);
  }

  goToStatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }

  goToManager() {
    this.router.navigate(['/manager']);
  }

  goToComment() {
    this.router.navigate(['/manager-comment']);
  }

  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }

  ngOnInit(): void {
    this.takeManga()
      .then(() => this.takecategory())
      .then(() => this.takeAll())
      .catch(error => console.error('Error loading data:', error));
  }


  takeAll() {
    this.numberManga = this.recentMangas.length;
    this.totalRead = 0;

    for (let i = 0; i < this.recentMangas.length; i++) {
      this.totalRead += Number(this.recentMangas[i].totalViews);
    }
    const countDict: { [key: number]: number } = {};
    for (const item of this.category) {
      const id_category = item.id_category;
      if (id_category in countDict) {
        countDict[id_category] += 1;
      } else {
        countDict[id_category] = 1;
      }
    }
    const maxCount = Math.max(...Object.values(countDict));
    const mostFrequentIdCategories = Object.keys(countDict)
      .filter(key => countDict[Number(key)] === maxCount)
    console.log(Number(mostFrequentIdCategories));

  }
  takecategory() {
    return new Promise<void>((resolve, reject) => {
      this.CategoryDetailsService.getCategories().subscribe(
        (data) => {
          this.category = data;
          resolve();
        },
        (error) => {
          console.error('Error fetching categories:', error);
          reject(error);
        }
      );
    });
  }

  takeManga(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mangaService.getMangas().subscribe({
        next: (mangas) => {
          this.mangas = mangas;
          const observables = this.mangas.map(manga =>
            this.mangaViewHistoryService.getAllView(manga.id_manga).pipe(
              map(totalViews => {
                manga.totalViews = totalViews;
                return manga;
              })
            )
          );

          forkJoin(observables).subscribe({
            next: (updatedMangas) => {
              this.sortMangas(updatedMangas);
              resolve(); // Resolve the promise after sorting
            },
            error: (err) => {
              console.error('Error fetching views:', err);
              reject(err); // Reject the promise on error
            }
          });
        },
        error: (err) => {
          console.error('Error fetching mangas:', err);
          reject(err); // Reject the promise on error
        }
      });
    });
  }

  sortMangas(mangas: Manga[]) {
    this.recentMangas = mangas.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }
}
