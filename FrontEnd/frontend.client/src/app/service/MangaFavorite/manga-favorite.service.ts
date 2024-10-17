import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {ModelMangaFavorite} from "../../Model/MangaFavorite";


@Injectable({
  providedIn: 'root'
})
export class MangaFavoriteService {
  private apiUrl = 'https://localhost:44348/api/mangas';

  constructor(private http: HttpClient) {
  }

  isFavorited(idAccount: number, idManga: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/isFavorite?idAccount=${idAccount}&idManga=${idManga}`)
  }

  toggleFavorite(idAccount: number, idManga: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorite/toggle?idAccount=${idAccount}&idManga=${idManga}`, {});
  }

  getMangaFavByAccount(idAccount: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/favorite?idAccount=${idAccount}`);
  }

  getMangaFavorite(): Observable<ModelMangaFavorite[]> {
    return this.http.get<ModelMangaFavorite[]>('https://localhost:44348/api/mangafavorite');
  }
}
