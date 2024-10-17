import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MangaFavoriteService} from "../../../service/MangaFavorite/manga-favorite.service";
import {MangaService} from "../../../service/Manga/manga.service";
import { Observable, forkJoin } from 'rxjs';

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
  totalViews: number;
  rated_num: number;
}

interface MangaFavorite {
  id_manga: number;
  id_account: number;
  is_favorite: boolean;
}

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css']
})
export class FavoriteComponent implements OnInit {
  favoriteMangas: MangaFavorite[] = [];
  mangas: Manga[] = [];

  constructor(
    private router: Router,
    private mangaFavoriteService: MangaFavoriteService,
    private mangaService: MangaService
  ) {}

  ngOnInit() {
    const idNumber = Number(localStorage.getItem('userId'));
    this.mangaFavoriteService.getMangaFavByAccount(idNumber).subscribe(fm => {
      this.favoriteMangas = fm;
      const mangaObservables: Observable<Manga>[] = this.favoriteMangas.map(fav =>
        this.mangaService.getMangaById(fav.id_manga)
      );
      forkJoin(mangaObservables).subscribe(mangaList => {
        this.mangas = mangaList;
      });
    });
  }

  removeFromFavorites(mangaId: number) {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn bỏ yêu thích manga này?");

    if (confirmDelete) {
      const idNumber = Number(localStorage.getItem('userId'));
      this.mangaFavoriteService.toggleFavorite(idNumber, mangaId).subscribe(() => {
        this.favoriteMangas = this.favoriteMangas.filter(manga => manga.id_manga !== mangaId);
        this.mangas = this.mangas.filter(manga => manga.id_manga !== mangaId);
      });
    }
  }
}
