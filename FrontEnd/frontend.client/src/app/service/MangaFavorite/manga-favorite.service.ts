import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from "rxjs";
import {ModelMangaFavorite} from "../../Model/MangaFavorite";


@Injectable({
  providedIn: 'root'
})
export class MangaFavoriteService {
  private apiUrl = 'https://localhost:44379/api/mangafavorite';

  constructor(private http: HttpClient) {
  }

  getMangaFavorite(): Observable<ModelMangaFavorite[]> {
    return this.http.get<ModelMangaFavorite[]>(this.apiUrl);
  }
  addMangaFavorite(MangaFavorite: ModelMangaFavorite): Observable<ModelMangaFavorite> {
    return this.http.post<ModelMangaFavorite>(this.apiUrl, MangaFavorite);
  }

  updateMangaFavorite(Comment: ModelMangaFavorite): Observable<ModelMangaFavorite> {
    return this.http.put<ModelMangaFavorite>(this.apiUrl, Comment);
  }
}
