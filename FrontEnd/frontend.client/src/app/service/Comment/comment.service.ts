import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelComment} from "../../Model/ModelComment";


@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private apiUrl = 'https://localhost:7124/api/comment';


  constructor(private http: HttpClient) {
  } // Removed the array brackets
  addComment(Comment: ModelComment): Observable<ModelComment> {
    return this.http.post<ModelComment>(this.apiUrl, Comment);
  }

  getCommnet(): Observable<ModelComment[]> {
    return this.http.get<ModelComment[]>(this.apiUrl);
  }

  updateComment(Comment: ModelComment): Observable<ModelComment> {
    return this.http.put<ModelComment>(this.apiUrl, Comment);
  }

  deleteBanner(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }
}
