import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class MangaHistoryService {
  private apiUrl = 'https://localhost:44352/api/mangas';

  constructor(private http: HttpClient) {
  }

  getMangaHistory(id_account: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_account}`);
  }

  addMangaHistory(id_account: number, id_manga: number, id_chapter: number): Observable<any> {
    const body = {
      id_account: id_account,
      id_manga: id_manga,
      id_chapter: id_chapter
    };
    return this.http.post(`${this.apiUrl}/create/history`, body);
  }
}
