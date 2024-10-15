import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class MangaViewHistoryService {
  private apiUrl = 'https://localhost:44352/api/manga';

  constructor(private http: HttpClient) {
  }

  getAllView(idManga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getAllView`);
  }

  getViewByDay(idManga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getViewByDay`);
  }

  getViewByWeek(idManga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getViewByWeek`);
  }

  getViewByMonth(idManga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getViewByMonth`);
  }
}
