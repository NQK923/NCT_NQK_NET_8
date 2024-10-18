import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BannerService} from '../../../service/Banner/banner.service';
import {ModelBanner} from '../../../Model/ModelBanner';
import {MangaService} from '../../../service/Manga/manga.service';
import {forkJoin, map} from 'rxjs';
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
  rated_num: number;
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
  topViewMangas: Manga[] = [];
  topRatedMangas: Manga[] = [];
  selectedTab: string = 'day';
  banners: ModelBanner[] = [];
  threeBanners: ModelBanner[] = [];
  threeBanners1: ModelBanner[] = [];
  twoBanners: ModelBanner[] = [];

  constructor(private router: Router, private mangaService: MangaService, private bannerService: BannerService, private mangaViewHistoryService: MangaViewHistoryService) {
  }

  ngOnInit(): void {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        this.mangaViewHistoryService.getAllView(manga.id_manga).pipe(
          map(totalViews => {
            manga.totalViews = totalViews;
            return manga;
          })
        )
      );
      forkJoin(observables).subscribe(updatedMangas => {
        this.sortMangas(updatedMangas);
      });
      this.setTab('day');
    });
    this.loadBanners();
  }

  sortMangas(mangas: Manga[]) {
    this.recentMangas = mangas
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 12);

    this.topMangas = mangas
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 12);

    this.topRatedMangas = mangas
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);
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
      .slice(0, 5);
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


  loadBanners(): void {
    this.bannerService.getBanner().subscribe(
      (data: ModelBanner[]) => {
        this.banners = data;
        this.threeBanners = this.banners.slice(5, 8);
        this.threeBanners1 = this.banners.slice(8, 11);
        this.twoBanners = this.banners.slice(0, 4);
      },
      error => {
        console.error('Lỗi khi lấy banner', error);
      }
    );
  }


  viewMangaDetails(id_manga: number) {
    this.router.navigate(['/titles', id_manga]);
  }

  click(temp: string): void {
    window.open(temp);
  }
}
