import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ModelNotificationMangaAccount} from '../../Model/ModelNotificationMangaAccount';
import {Observable} from 'rxjs';
import {ModelNotification} from "../../Model/ModelNotification";

@Injectable({
  providedIn: 'root'
})
export class NotificationMangaAccountService {
  private apiUrl = 'https://localhost:44379/api/notificationMangAccount';

  constructor(private http: HttpClient) {
  } // Removed the array brackets
  getNotificationMangaAccount(): Observable<ModelNotificationMangaAccount[]> {
    return this.http.get<ModelNotificationMangaAccount[]>(this.apiUrl);
  }
  addinfonotification(notification: ModelNotificationMangaAccount): Observable<ModelNotificationMangaAccount> {
    return this.http.post<ModelNotificationMangaAccount>(this.apiUrl, notification);
  }
}
