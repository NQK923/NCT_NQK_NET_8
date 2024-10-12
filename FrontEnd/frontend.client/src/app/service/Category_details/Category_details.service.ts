import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryDetailsService {
  private apiUrl = 'https://localhost:44347/api';

  constructor(private http: HttpClient) {
  }

  getCategoriesByIdManga(id_manga: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/category_details/${id_manga}`);
  }

  addCategoriesDetails(list: number[]): Observable<any[]> {
    return this.http.post<any>(`${this.apiUrl}/add_manga_category`, list);
  }

  updateCategoriesDetails(list: number[]): Observable<any[]> {
    return this.http.put<any>(`${this.apiUrl}/update_manga_category`, list);
  }
}
