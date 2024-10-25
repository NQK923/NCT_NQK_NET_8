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
  private apiUrlLogin = 'https://localhost:44385/api/Login';
  private apiInfo = 'https://localhost:44387/api/InfoAccount';
  private apiAvatar = 'https://localhost:44387/api/InfoAccountavata';
  private apiUpdateAccount = 'https://localhost:44387/api/InfoAccountupdate';
  private apiPassword = "https://localhost:44385/api/password";
  private apiac = "https://localhost:44385/api/AccountById";

  constructor(private http: HttpClient) {
  }

  postMail(email: string, title: string, text: string): Observable<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('title', title)
      .set('text', text);
    return this.http.post(this.apiPassword, null, {params});
  }

  updateaccount(account: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.put<ModelInfoAccount>(this.apiUpdateAccount, account);
  }

  getAccountById(id_account: number): Observable<ModelAccount> {
    return this.http.get<ModelAccount>(`${this.apiac}/${id_account}`);
  }

  uploadavata(formData: FormData): Observable<any> {
    return this.http.post(this.apiAvatar, formData);
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

  getinfoAccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiInfo);
  }

  login(Account: ModelAccount): Observable<ModelAccount> {
    return this.http.post<ModelAccount>(this.apiUrlLogin, Account);
  }

}
