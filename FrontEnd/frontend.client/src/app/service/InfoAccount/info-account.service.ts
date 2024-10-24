import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ModelInfoAccount} from '../../Model/ModelInfoAccoutn';
import {ModelAccount} from "../../Model/ModelAccount";

@Injectable({
  providedIn: 'root'
})
export class InfoAccountService {

  private apiUrl = 'https://localhost:44387/api/InfoAccount';
  private api='https://localhost:44387/api/InfoAccountById';


  constructor(private http: HttpClient) {
  }

  getinfoaccount(): Observable<ModelInfoAccount[]> {
    return this.http.get<ModelInfoAccount[]>(this.apiUrl);
  }
  getInfoAccountById(id_account: number): Observable<ModelInfoAccount> {
    return this.http.get<ModelInfoAccount>(`${this.api}/${id_account}`);
  }


  addInfoAccount(InfoAccount: ModelInfoAccount): Observable<ModelInfoAccount> {
    return this.http.post<ModelInfoAccount>(this.apiUrl, InfoAccount);
  }
}
