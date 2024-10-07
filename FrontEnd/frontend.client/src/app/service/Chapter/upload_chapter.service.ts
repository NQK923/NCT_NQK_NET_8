import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadChapterService {
  private apiUrl = 'https://localhost:44345/api/upload/chapter';

  constructor(private http: HttpClient) {
  }

  addChapter(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }

  updateChapter(id: number, formData: FormData): Observable<any> {
    return this.http.put(`https://localhost:44345/api/update/chapter/${id}`, formData);
  }
}
