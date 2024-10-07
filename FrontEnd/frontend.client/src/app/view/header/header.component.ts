import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../Model/ModelAccount";
import {AccountService} from "../../service/Account/account.service";
import {ModelInfoAccount} from "../../Model/ModelInfoAccount";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  accounts: ModelAccount[] = [];
  infoAccounts: ModelInfoAccount[] = [];
  url: string | null = null;
  name: string | null = null;
  idaccount: number | null = null;

  constructor(private router: Router, private accountService: AccountService) {
  }

  ngOnInit() {
    this.Takedata();
  }

  Takedata() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idaccount = parseInt(userId, 10);
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.accounts = data;
          if (this.idaccount !== null) {
            this.findUser(this.idaccount);
          }
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );

      // Fetch account info
      this.accountService.getinfoAccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoAccounts = data;
          if (this.idaccount !== null) {
            this.findurl(this.idaccount);
          }
        },
        (error) => {
          console.error('Error fetching account info:', error);
        }
      );

    } else {
      console.error('No userId found in localStorage');
    }
  }

  findUser(userId: number) {
    for (let i = 0; i < this.accounts.length; i++) {

      if (this.accounts[i].id_account === userId) {
        this.name = this.accounts[i].username || null;
        console.log(this.name);
        break;
      }
    }
  }

  findurl(userId: number) {
    for (let i = 0; i < this.infoAccounts.length; i++) {
      if (this.infoAccounts[i].id_account === userId) {
        this.url = this.infoAccounts[i].cover_img || null;
        console.log(this.url);
        break;
      }
    }
  }

  goToIndex() {
    this.router.navigate(['/']);
  }


  goTolistview() {
    this.router.navigate(['/list-view']);
  }


  goToRank() {
    this.router.navigate(['/rank']);
  }


  goToHistory() {
    this.router.navigate(['/history']);
  }


  goToFaverite() {
    this.router.navigate(['/faverite']);
  }


  goToLogin() {
    this.router.navigate(['/login']);
  }


  goToNotification() {
    this.router.navigate(['/notification']);
  }


  goToclientmanager() {
    this.router.navigate(['/client-manager']);
  }
}
