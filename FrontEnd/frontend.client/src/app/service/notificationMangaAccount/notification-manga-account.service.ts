import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelNotificationMangaAccount} from '../../Model/ModelNotificationMangaAccount';
import {catchError, Observable, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationMangaAccountService {
  private apiUrl = 'https://localhost:44305/api/notificationMangAccount';
  private api= 'https://localhost:44305/api/notificationMangAccountById';

  constructor(private http: HttpClient) {
  }

  getNotificationMangaAccount(): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(this.apiUrl);
  }

  getNotificationMangaAcById( Id_manga: number): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(`${this.api}/?Id_manga=${Id_manga}`).pipe(
      catchError((error: any) => {
        console.error('Error fetching notification manga account', error);
        return throwError(error);
      })
    );
  }
  addInfoNotification(notification: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.post<ModelNotificationMangaAccount>(this.apiUrl, notification);
  }

  updateNotificationAccount(Comment: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.put<ModelNotificationMangaAccount>(this.apiUrl, Comment);
  }
}
