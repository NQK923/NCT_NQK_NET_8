import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelInfoAccount} from '../../Model/ModelInfoAccoutn';

@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  // private apiUrl = 'https://localhost:44387/api/InfoAccount';
  // private api = 'https://localhost:44387/api/InfoAccountById';

  private apiUrl = `${window.location.protocol}//${window.location.hostname}:5004/api/InfoAccount`;
  private api = `${window.location.protocol}//${window.location.hostname}:5004/api/InfoAccountById`;


  constructor(private http: HttpClient) {
  }

  getInfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }

  getInfoAccountById(id_account: number): Observable<ModelInfoAccount> {
    return this.http.get<ModelInfoAccount>(`${this.api}/${id_account}`);
  }

  addInfoAccount(InfoAccount: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.post<ModelInfoAccount>(this.apiUrl, InfoAccount);
  }
}
