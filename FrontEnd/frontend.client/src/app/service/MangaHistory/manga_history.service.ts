import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable(
  {
    providedIn: 'root'
  }
)
export class MangaHistoryService {
  private apiUrl = 'https://localhost:44379/api/notificationMangaAccount';

  constructor(private http: HttpClient) {
  }

  getMangaHistory(id_account: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id_account}`);
  }

}
