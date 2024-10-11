import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

//nguyen
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
}

//nguyen
@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = 'https://localhost:44355/api/mangas';

  constructor(private http: HttpClient) {
  }

  getMangas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMangasByUser(id: number): Observable<any> {
    return this.http.get<any>(`https://localhost:44355/api/user/${id}/mangas`);
  }

  //nguyen
  getlistMangas(): Observable<Manga[]> {
    return this.http.get<Manga[]>(this.apiUrl);
  }
}
