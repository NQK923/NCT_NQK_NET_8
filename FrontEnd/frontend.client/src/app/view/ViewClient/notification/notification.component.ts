import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelNotification} from '../../../Model/ModelNotification';
import {ModelNotificationMangaAccount} from '../../../Model/ModelNotificationMangaAccount';
import {ModelInfoAccount} from '../../../Model/ModelInfoAccoutn';
import {NotificationService} from '../../../service/notification/notification.service';
import {
  NotificationMangaAccountService
} from '../../../service/notificationMangaAccount/notification-manga-account.service';
import {InfoAccountService} from '../../../service/InfoAccount/info-account.service';
import {ModelManga} from "../../../Model/ModelManga";

export class CombinedData {
  Notification: ModelNotification | null;  // Changed to allow null
  NotificationMangaAccounts: ModelNotificationMangaAccount | null;  // Changed to allow null
  InfoAccount: ModelInfoAccount | null;
  Mangainfo: ModelManga | null;// Changed to allow null

  constructor(
    notification: ModelNotification | null,
    mangaAccount: ModelNotificationMangaAccount | null,
    infoAccount: ModelInfoAccount | null,
    mangainfo: ModelManga | null,
  ) {
    this.Notification = notification;
    this.NotificationMangaAccounts = mangaAccount;
    this.InfoAccount = infoAccount;
    this.Mangainfo=mangainfo;
  }
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  notifications: ModelNotification[] = [];
  notificationMangaAccounts: ModelNotificationMangaAccount[] = [];
  infoaccount: ModelInfoAccount[] = [];
  mangas: ModelManga[] = [];
  ListcombinedData: CombinedData[] = [];
  CombinedData: CombinedData[] = [];

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private infoAccountservice: InfoAccountService,
    private notificationMangaAccountService: NotificationMangaAccountService,
    private cdr: ChangeDetectorRef,

  ) {
  }

  ngOnInit(): void {
    this.loadNotificationMangaAccount()
      .then(()=> this.loadInfomanga())
      .then(() => this.loadInfoAccount())
      .then(() => this.loadNotifications())
      .then(() => this.takedata())
      .catch(error => console.error('Error loading data:', error));
  }

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

      this.ListcombinedData.push(new CombinedData(
        matchedNotifications[0] || null,
        this.notificationMangaAccounts[i],
        matchedInfoAccounts[0] || null ,
        matchedmanga[0] || null
      ));
    }
    // const idAccount = localStorage.getItem('userId');
    // if (idAccount !== null) {
    //   const parsedIdAccount = parseInt(idAccount, 10);

      for (let i = 0; i < this.ListcombinedData.length; i++) {
        this.CombinedData.push(this.ListcombinedData[i]);
          console.log(this.ListcombinedData[i].Mangainfo?.name,this.ListcombinedData[i].Notification?.content, this.ListcombinedData[i].Notification?.time, this.ListcombinedData[i].InfoAccount?.cover_img, this.ListcombinedData[i].InfoAccount?.name);

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
