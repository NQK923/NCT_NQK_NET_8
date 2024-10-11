import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../Model/ModelAccount";
import {AccountService} from "../../service/Account/account.service";
import {ModelInfoAccount} from "../../Model/ModelInfoAccount";
import {ModelNotification} from "../../Model/ModelNotification";
import {ModelManga} from "../../Model/ModelManga";
import {ModelNotificationMangaAccount} from "../../Model/ModelNotificationMangaAccount";
import {NotificationService} from "../../service/notification/notification.service";
import {InfoAccountService} from "../../service/InfoAccount/info-account.service";
import {
  NotificationMangaAccountService
} from "../../service/notificationMangaAccount/notification-manga-account.service";
import {CombinedData} from "../../Model/CombinedData";

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
  notifications: ModelNotification[] = [];
  notificationMangaAccounts: ModelNotificationMangaAccount[] = [];
  infoaccount: ModelInfoAccount[] = [];
  mangas: ModelManga[] = [];
  ListcombinedData: CombinedData[] = [];
  CombinedData: CombinedData[] = [];
  isHidden: boolean = true;

  constructor(private accountService: AccountService,
              private router: Router,
              private notificationService: NotificationService,
              private infoAccountservice: InfoAccountService,
              private notificationMangaAccountService: NotificationMangaAccountService,
              private cdr: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.Takedata();
    this.loadNotificationMangaAccount()
      .then(() => this.loadInfomanga())
      .then(() => this.loadInfoAccount())
      .then(() => this.loadNotifications())
      .then(() => this.takedata())
      .catch(error => console.error('Error loading data:', error));

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
    this.isHidden = !this.isHidden;
  }


  goToclientmanager() {
    this.router.navigate(['/client-manager']);
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


  // thong bao
  takedata(): void {
    for (let i = 0; i < this.notificationMangaAccounts.length; i++) {
      const matchedNotifications: ModelNotification[] = [];
      const matchedInfoAccounts: ModelInfoAccount[] = [];
      const matchedmanga: ModelManga[] = [];

      for (let j = 0; j < this.notifications.length; j++) {
        if (this.notificationMangaAccounts[i].id_Notification === this.notifications[j].id_Notification) {
          matchedNotifications.push(this.notifications[j]);
        }
      }
      for (let j = 0; j < this.mangas.length; j++) {
        if (this.notificationMangaAccounts[i].id_manga === this.mangas[j].id_manga) {
          matchedmanga.push(this.mangas[j]);
        }
      }
      for (let j = 0; j < this.infoaccount.length; j++) {
        if (this.notificationMangaAccounts[i].id_account === this.infoaccount[j].id_account) {
          matchedInfoAccounts.push(this.infoaccount[j]);
        }
      }
      this.ListcombinedData.push({
        Notification: matchedNotifications[0] || null,
        NotificationMangaAccounts: this.notificationMangaAccounts[i],
        InfoAccount: matchedInfoAccounts[0] || null,
        Mangainfo: matchedmanga[0] || null
      } as CombinedData);

    }
    // const idAccount = localStorage.getItem('userId');
    // if (idAccount !== null) {
    //   const parsedIdAccount = parseInt(idAccount, 10);

    for (let i = 0; i < this.ListcombinedData.length; i++) {
      this.CombinedData.push(this.ListcombinedData[i]);
      console.log(this.ListcombinedData[i].Mangainfo?.name, this.ListcombinedData[i].Notification?.content, this.ListcombinedData[i].Notification?.time, this.ListcombinedData[i].InfoAccount?.cover_img, this.ListcombinedData[i].InfoAccount?.name);

    }
    // }
  }

  goToIndex(): void {
    this.router.navigate(['/']);
  }

  loadNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationService.getNotification().subscribe(
        (data: ModelNotification[]) => {
          this.notifications = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching notifications', error);
          reject(error);
        }
      );
    });
  }

  loadNotificationMangaAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationMangaAccountService.getNotificationMangaAccount().subscribe(
        (data: ModelNotificationMangaAccount[]) => {
          this.notificationMangaAccounts = data;
          this.cdr.detectChanges();
          resolve();
          console.log(this.notificationMangaAccounts);
        },
        (error: any) => {
          console.error('Error fetching notification manga accounts', error);
          reject(error);
        }
      );
    });
  }

  loadInfoAccount(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.infoAccountservice.getinfoaccount().subscribe(
        (data: ModelInfoAccount[]) => {
          this.infoaccount = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error);
        }
      );
    });
  }

  loadInfomanga(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.notificationService.getManga().subscribe(
        (data: ModelManga[]) => {
          this.mangas = data;
          this.cdr.detectChanges();
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error);
        }
      );
    });
  }
}
