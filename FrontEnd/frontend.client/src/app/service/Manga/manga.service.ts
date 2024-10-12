﻿import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  private apiUrl = 'https://localhost:44355/api/manga'

  constructor(private http: HttpClient) {
  }

  getMangas(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMangasByUser(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${id}/mangas`);
  }

  getMangaById(id_manga: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id_manga}`);
  }

  deleteMangaById(id_manga: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete/${id_manga}`);
  }

  uploadManga(formData: FormData, id_account: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/${id_account}`, formData, {
      responseType: "arraybuffer",
      headers: new HttpHeaders({'Accept': 'application/json'})
    });
  }
}
