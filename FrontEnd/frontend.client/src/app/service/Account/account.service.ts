import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ModelAccount} from '../../Model/ModelAccount'
import {ModelInfoAccount} from "../../Model/ModelInfoAccoutn";


@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'https://localhost:44385/api/Account';
  private apiUrlloggin = 'https://localhost:44385/api/Login';
  private apiinfo = 'https://localhost:44387/api/InfoAccount';
  private apiavata = 'https://localhost:44387/api/InfoAccountavata';
  private updateac = 'https://localhost:44387/api/InfoAccountupdate';
  private apiPassword = "https://localhost:44385/api/password";

  constructor(private http: HttpClient) {
  }

  postMail(email: string, title: string, text: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('title', title)
      .set('text', text);
    console.log(params.toString());

    return this.http.post(this.apiPassword, null, {params});
  }

  updateaccount(account: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.put<ModelInfoAccount>(this.updateac, account);
  }


  uploadavata(formData: FormData): Observable<any> {
    return this.http.post(this.apiavata, formData);
  }

  getAccount(): Observable<ModelAccount[]> {
    return this.http.get<ModelAccount[]>(this.apiUrl);
  }

  addAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.post<ModelAccount>(this.apiUrl, Account);
  }

  updateAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.put<ModelAccount>(this.apiUrl, Account);
  }

  upDateAccount(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.put<ModelAccount>(this.apiavata, Account);
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
