import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BannerService} from '../../../service/Banner/banner.service';
import {ModelBanner} from '../../../Model/ModelBanner';
import {MangaService} from '../../../service/Manga/manga.service';
import {ChapterService} from '../../../service/Chapter/chapter.service';
import {forkJoin, map, Observable} from 'rxjs';
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
  unSortMangas: Manga[] = [];
  recentMangas: Manga[] = [];
  topMangas: Manga[] = [];
  topViewMangas: Manga[] = [];
  topRatedMangas: Manga[] = [];
  selectedTab: string = 'day';
  banners: ModelBanner[] = [];
  threeBanners: ModelBanner[] = [];
  twoBanners: ModelBanner[] = [];

  constructor(private router: Router, private mangaService: MangaService, private chapterService: ChapterService, private bannerService: BannerService, private mangaViewHistoryService: MangaViewHistoryService) {
  }

  ngOnInit(): void {
    this.mangaService.getMangas().subscribe(mangas => {
      this.mangas = mangas;
      const observables = this.mangas.map(manga =>
        this.chapterService.getTotalViewsByMangaId(manga.id_manga).pipe(
          map(result => {
            manga.totalViews = result.totalViews;
            return manga;
          })
        )
      );
      forkJoin(observables).subscribe(updatedMangas => {
        this.sortMangas(updatedMangas);
      });
      this.unSortMangas = this.mangas;
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
        this.getTopMangasByView((id) => this.mangaViewHistoryService.getViewByDay(id));
        break;
      case 'week':
        this.getTopMangasByView((id) => this.mangaViewHistoryService.getViewByWeek(id));
        break;
      case 'month':
        this.getTopMangasByView((id) => this.mangaViewHistoryService.getViewByMonth(id));
        break;
    }
  }

  getTopMangasByView(viewService: (idManga: number) => Observable<Manga>) {
    console.log("Test");
    const viewRequests = this.unSortMangas.map(manga => viewService(manga.id_manga));
    Promise.all(viewRequests).then((views) => {
      this.unSortMangas.forEach((manga, index) => {
        console.log("view:"+views[index]);
        manga.totalViews = Number(views[index]);
      });
      this.topViewMangas = [...this.unSortMangas].sort((a, b) => b.totalViews - a.totalViews).slice(0, 5);
    });
  }

  loadBanners(): void {
    this.bannerService.getBanner().subscribe(
      (data: ModelBanner[]) => {
        this.banners = data;
        this.threeBanners = this.banners.slice(2, 5);
        this.twoBanners = this.banners.slice(0, 2);
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
