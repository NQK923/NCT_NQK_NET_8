import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MangaFavoriteService {
  private apiUrl = 'https://localhost:44348/api';
constructor(private http: HttpClient) {
}

getMangaFavorite(): Observable<any> {
  return this.http.get(``)
}
}
