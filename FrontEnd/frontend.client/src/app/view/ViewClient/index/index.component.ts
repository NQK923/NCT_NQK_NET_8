import {Component, HostListener, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelBanner} from '../../../Model/ModelBanner';
import {MangaService} from '../../../service/Manga/manga.service';
import {forkJoin, map} from 'rxjs';
import {MangaViewHistoryService} from "../../../service/MangaViewHistory/MangaViewHistory.service";
import {register} from "swiper/element/bundle";
import {CategoriesService} from "../../../service/Categories/Categories.service";
import {CategoryDetailsService} from "../../../service/Category_details/Category_details.service";
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {ChapterService} from "../../../service/Chapter/chapter.service";

register()

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
  categories: string[];
  follower: number;
  latestChapter: number;
}

interface Category {
  id_category: number;
  name: string;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  mangas: Manga[] = [];
  recentMangas: Manga[] = [];
  topMangas: Manga[] = [];
  popularMangas: Manga[] = [];
  topViewMangas: Manga[] = [];
  topRatedMangas: Manga[] = [];
  selectedTab: string = 'day';
  banners: ModelBanner[] = [];
  categories: Category[] = [];
  isSmallScreen: boolean = false;

  constructor(private router: Router,
              private mangaService: MangaService,
              private mangaViewHistoryService: MangaViewHistoryService,
              private categoriesService: CategoriesService,
              private categoryDetailsService: CategoryDetailsService,
              private mangaFavoriteService: MangaFavoriteService,
              private chapterService: ChapterService,
  ) {
  }

  ngOnInit(): void {
    this.checkScreenSize();
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        forkJoin({
          totalViews: this.mangaViewHistoryService.getAllView(manga.id_manga),
          followers: this.mangaFavoriteService.countFollower(manga.id_manga),
          latestChapter: this.chapterService.getLastedChapter(manga.id_manga),
        }).pipe(
          map(({totalViews, followers, latestChapter}) => {
            manga.totalViews = totalViews;
            manga.follower = followers;
            manga.latestChapter=latestChapter;
            return manga;
          })
        )
      );
      forkJoin(observables).subscribe(updatedMangas => {
        this.sortMangas(updatedMangas);
      });
      this.setTab('day');
    });
  }

  sortMangas(mangas: Manga[]) {
    this.recentMangas = mangas
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10);
    this.recentMangas.forEach(manga => {
      forkJoin({
        categories: this.getCategoriesForManga(manga.id_manga)
      }).subscribe(({categories}) => {
        console.log("Cate", categories);
        manga.categories = categories;
      });
    });
    this.popularMangas = mangas
      .sort((a, b) => b.follower - a.follower)
      .slice(0, 8);
    this.topMangas = mangas
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 8);

    this.topRatedMangas = mangas
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
  }

  setTab(tab: string) {
    this.selectedTab = tab;
    switch (tab) {
      case 'day':
        this.getTopMangasByDay();
        break;
      case 'week':
        this.getTopMangasByWeek();
        break;
      case 'month':
        this.getTopMangasByMonth();
        break;
    }
  }

  processTopMangas(list: Manga[]) {
    this.topViewMangas = list
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 8);
  }

  getTopMangasByDay() {
    const list = this.mangas.map(manga => ({...manga}));
    let completedRequests = 0;
    for (let manga of list) {
      this.mangaViewHistoryService.getViewByDay(manga.id_manga).subscribe(
        (views) => {
          manga.totalViews = views;
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        },
        (error) => {
          console.error("Error fetching views for manga with id: " + manga.id_manga, error);
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        }
      );
    }
  }

  getTopMangasByWeek() {
    const list = this.mangas.map(manga => ({...manga}));
    let completedRequests = 0;
    for (let manga of list) {
      this.mangaViewHistoryService.getViewByWeek(manga.id_manga).subscribe(
        (views) => {
          manga.totalViews = views;
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        },
        (error) => {
          console.error("Error fetching views for manga with id: " + manga.id_manga, error);
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        }
      );
    }
  }

  getTopMangasByMonth() {
    const list = this.mangas.map(manga => ({...manga}));
    let completedRequests = 0;
    for (let manga of list) {
      this.mangaViewHistoryService.getViewByMonth(manga.id_manga).subscribe(
        (views) => {
          manga.totalViews = views;
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        },
        (error) => {
          console.error("Error fetching views for manga with id: " + manga.id_manga, error);
          completedRequests++;
          if (completedRequests === list.length) {
            this.processTopMangas(list);
          }
        }
      );
    }
  }

  getTimeDifference(updatedTime: string | Date): string {
    const updatedDate = typeof updatedTime === 'string' ? new Date(updatedTime) : updatedTime;
    const currentDate = new Date();

    const diffInMs = currentDate.getTime() - updatedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else if (diffInDays < 30) {
      return `${diffInWeeks} tuần trước`;
    } else {
      return `${diffInMonths} tháng trước`;
    }
  }

  getCategoriesForManga(id_manga: number) {
    console.log("Test");
    return forkJoin({
      categoryDetails: this.categoryDetailsService.getCategoriesByIdManga(id_manga),
      allCategories: this.categoriesService.getAllCategories()
    }).pipe(
      map(({categoryDetails, allCategories}) => {
        return allCategories
          .filter(category => categoryDetails.some(detail => detail.id_category === category.id_category))
          .map(category => category.name);
      })
    );
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }
  checkScreenSize() {
    this.isSmallScreen = window.innerWidth <= 768;
  }

  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  goToListView() {
    this.router.navigate(['/list-view']);
  }

  goToRank() {
    this.router.navigate(['/rank']);
  }

  click(temp: string): void {
    window.open(temp);
  }
}
