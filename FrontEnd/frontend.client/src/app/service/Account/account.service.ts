import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ModelAccount} from '../../Model/ModelAccount'
import {ModelInfoAccount} from '../../Model/ModelInfoAccount'


@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:44385/api/Account';
  private apiUrlloggin = 'https://localhost:44385/api/Login';
  private apiinfo = 'http://localhost:5209/api/InfoAccount';

  constructor(private http: HttpClient) {
  } // Removed the array brackets


  getAccount(): Observable<ModelAccount[]> {
    return this.http.get<ModelAccount[]>(this.apiUrl);
  }

  addAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.post<ModelAccount>(this.apiUrl, Account);
  }

  getinfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiinfo);
  }

  addinfoAccount(infoAccount: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.post<ModelInfoAccount>(this.apiinfo, infoAccount);
  }

  login(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.post<ModelAccount>(this.apiUrlloggin, Account);
  }

}
