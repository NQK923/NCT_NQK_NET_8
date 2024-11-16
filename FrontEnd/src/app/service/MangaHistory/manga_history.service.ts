import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class MangaHistoryService {
  //private apiUrl = 'https://localhost:44352/api/mangas';

  private apiUrl = `${window.location.protocol}//${window.location.hostname}:5001/api/mangas`;

  constructor(private http: HttpClient) {
  }

  getSimpleHistory(id_account: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/simple_history/${id_account}`);
  }

  getHistory(id_account: number, id_manga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history/${id_account}/${id_manga}`);
  }

  addMangaHistory(IdAccount: number, IdManga: number, IndexChapter: number): Observable<any> {
    const body = {
      IdAccount: IdAccount,
      IdManga: IdManga,
      IndexChapter: IndexChapter
    };
    return this.http.post(`${this.apiUrl}/create/history`, body);
  }

  deleteMangaHistory(id_account: number, id_manga: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id_account}/${id_manga}`);
  }
}
