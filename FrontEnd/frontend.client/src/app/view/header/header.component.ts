import {ChangeDetectorRef, Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../Model/ModelAccount";
import {AccountService} from "../../service/Account/account.service";
import {ModelInfoAccount} from "../../Model/ModelInfoAccoutn";
import {ModelNotification} from "../../Model/ModelNotification";
import {ModelManga} from "../../Model/ModelManga";
import {ModelNotificationMangaAccount} from "../../Model/ModelNotificationMangaAccount";
import {NotificationService} from "../../service/notification/notification.service";
import {InfoAccountService} from "../../service/InfoAccount/info-account.service";
import {
  NotificationMangaAccountService
} from "../../service/notificationMangaAccount/notification-manga-account.service";
import {CombinedData} from "../../Model/CombinedData";
import {MangaFavoriteService} from "../../service/MangaFavorite/manga-favorite.service";
import {ModelMangaFavorite} from "../../Model/MangaFavorite";
import {concatMap, forkJoin, map, Observable} from "rxjs";
import {MangaService} from "../../service/Manga/manga.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchQuery: string = '';
  accounts: ModelAccount | undefined;
  infoAccounts: ModelInfoAccount | undefined;
  url: string | null = null;
  name: string | null = null;
  idAccount: number | null = null;
  infoAccount: ModelInfoAccount[] = [];
  mangas: ModelManga [] = [];
  mangaFavorite: ModelMangaFavorite[] = [];
  ListCombinedDatas: CombinedData[] = [];
  ListCombinedDatasIsread: CombinedData[] = [];
  isHidden: boolean = true;
  numberNotification: number | null = null;
  notification: ModelNotification | undefined;
  info: ModelInfoAccount | undefined;
  mangaInfo: ModelManga | undefined;

  constructor(private accountService: AccountService,
              private router: Router,
              private el: ElementRef,
              private notificationService: NotificationService,
              private infoAccountService: InfoAccountService,
              private notificationMangaAccountService: NotificationMangaAccountService,
              private mangaFavoriteService: MangaFavoriteService,
              private cdr: ChangeDetectorRef,
              private mangaService: MangaService,
  ) {
  }

  ngOnInit() {
    this.ListCombinedDatas = [];
    this.ListCombinedDatasIsread = [];
    this.allFunction()
  }

  allFunction() {
    this.TakeData();
    this.takenewdata()
  }

  takenewdataMangaFavorite(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mangaFavoriteService.getMangaFavByAccount(Number(this.idAccount)).subscribe(
        (data: ModelMangaFavorite[]) => {
          this.mangaFavorite = data;
          resolve();
        },
        (error: any) => {
          console.error('Error fetching info accounts', error);
          reject(error); // Reject the promise on error
        }
      );
    });
  }

  takenewdataNotification(id: number): Observable<ModelNotification> {
    return this.notificationService.getNotificationById(id);
  }

  takenewdataInfoAccount(id: number): Observable<ModelInfoAccount> {
    return this.infoAccountService.getInfoAccountById(id);
  }

  takenewdataManga(id: number): Observable<ModelManga> {
    return this.mangaService.getMangaById(id);
  }

  takenewdata() {
    this.takenewdataMangaFavorite().then(() => {
      const observables = [];
      for (let i = 0; i < this.mangaFavorite.length; i++) {
        if (this.mangaFavorite[i].is_notification == false) {
          break
        }
        observables.push(
          this.notificationMangaAccountService.getNotificationMangaAcById(this.mangaFavorite[i].id_manga).pipe(
            concatMap((notificationAcList: ModelNotificationMangaAccount[]) => {
              return forkJoin(
                notificationAcList.map((notificationAc) =>
                  forkJoin({
                    manga: this.takenewdataManga(Number(notificationAc.id_manga)),
                    notification: this.takenewdataNotification(Number(notificationAc.id_Notification)).pipe(
                      map((notification: ModelNotification | ModelNotification[]) => {
                        return Array.isArray(notification) ? notification[0] : notification;
                      })
                    ),
                    account: this.takenewdataInfoAccount(Number(notificationAc.id_account))
                  }).pipe(
                    map((result) => ({
                      ...result,
                      notificationAc: notificationAc
                    }))
                  )
                )
              );
            })
          )
        );
      }
      forkJoin(observables).subscribe((results) => {
        results.forEach((resultArray) => {
          resultArray.forEach((result) => {
            const combo: CombinedData = {
              Notification: result.notification,
              NotificationMangaAccounts: result.notificationAc,
              InfoAccount: result.account,
              Mangainfo: result.manga
            };
            if (combo.NotificationMangaAccounts?.is_read == false) {
              this.ListCombinedDatas.push(combo);
            } else {
              this.ListCombinedDatasIsread.push(combo);
            }
          });
        });
        console.log("Combined Data:", this.ListCombinedDatas);
        this.numberNotification = this.ListCombinedDatas.length;
      }, (error) => {
        console.error('Error fetching data', error);
      });
    }).catch((error) => {
      console.error('Error in takenewdata1:', error);
    });
  }


  //Search manga
  onSearch(): void {
    if (this.searchQuery.trim()) {
      if (this.router.url.includes('/list-view')) {
        this.router.navigate([], {queryParams: {search: this.searchQuery}});
      } else {
        this.router.navigate(['/list-view'], {queryParams: {search: this.searchQuery}});
      }
    }
  }

  logOut() {
    localStorage.setItem('userId', "-1");
    window.location.reload();
  }

  //get account info
  TakeData() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      if (this.idAccount == -1) {
        const History = this.el.nativeElement.querySelector('#History');
        const Favorite = this.el.nativeElement.querySelector('#Favorite');
        const clientManager = this.el.nativeElement.querySelector('#clientManager');
        const iconNotification = this.el.nativeElement.querySelector('#iconNotification');
        History.classList.add('hidden');
        Favorite.classList.add('hidden');
        clientManager.classList.add('hidden');
        iconNotification.classList.add('hidden');
      } else {
        const Login = this.el.nativeElement.querySelector('#Login');
        Login.classList.add('hidden');
        const Logout = this.el.nativeElement.querySelector('#Logout');
        Logout.classList.remove('hidden');
      }
    }
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      this.accountService.getAccountById(this.idAccount).subscribe(
        (data: ModelAccount) => {
          this.accounts = data;
          this.name = this.accounts.username || null;
        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );
      this.infoAccountService.getInfoAccountById(this.idAccount).subscribe(
        (data: ModelInfoAccount) => {
          this.infoAccounts = data;
          if (this.idAccount !== null) {
            this.url = this.infoAccounts.cover_img || null;
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

//updateread
  readNotification() {
    const updateObservables: Observable<ModelNotificationMangaAccount>[] = [];
    const allDatas = [...this.ListCombinedDatas, ...this.ListCombinedDatasIsread];
    for (let i = 0; i < allDatas.length; i++) {
      const notificationData = {
        id_manga: allDatas[i].Mangainfo?.id_manga,
        id_account: allDatas[i].InfoAccount?.id_account,
        id_Notification: allDatas[i].Notification?.id_Notification,
        isGotNotification: true,
        is_read: true,
      } as ModelNotificationMangaAccount;
      const observable = this.notificationMangaAccountService.updateNotificationAccount(notificationData);
      updateObservables.push(observable);
    }
    forkJoin(updateObservables).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error("Đã xảy ra lỗi trong quá trình xóa thông báo:", error);
      }
    });
  }

  // delete all notification
  deleteAllNotification() {
    const updateObservables: Observable<ModelNotificationMangaAccount>[] = [];
    const allDatas = [...this.ListCombinedDatas, ...this.ListCombinedDatasIsread];
    for (let i = 0; i < allDatas.length; i++) {
      const notificationData = {
        id_manga: allDatas[i].Mangainfo?.id_manga,
        id_account: allDatas[i].InfoAccount?.id_account,
        id_Notification: allDatas[i].Notification?.id_Notification,
        isGotNotification: false,
        is_read: true,
      } as ModelNotificationMangaAccount;

      const observable = this.notificationMangaAccountService.updateNotificationAccount(notificationData);
      updateObservables.push(observable);
      this.ngOnInit()
    }
    forkJoin(updateObservables).subscribe({
      next: (responses) => {
        // Handle responses if needed
        alert("Đã xóa hết thông báo");

      },
      error: (error) => {
        console.error("Đã xảy ra lỗi trong quá trình xóa thông báo:", error);
      }
    });
  }

  // }
  goToIndex(): void {
    this.searchQuery = ''
    this.router.navigate(['/']);
  }

  goToListView() {
    this.searchQuery = '';
    this.router.navigate(['/list-view']);
  }

  goToRank() {
    this.searchQuery = '';
    this.router.navigate(['/rank']);
  }

  goToHistory() {
    this.searchQuery = '';
    this.router.navigate(['/history']);
  }

  goToFavorite() {
    this.searchQuery = '';
    this.router.navigate(['/favorite']);
  }

  goToLogin() {
    this.searchQuery = '';
    this.router.navigate(['/login']);
  }

  goToNotification() {
    this.searchQuery = '';
    this.isHidden = !this.isHidden;
  }

  goUotNotification() {
    this.searchQuery = '';
    this.readNotification()
    this.ngOnInit()
    this.isHidden = !this.isHidden;
  }

  goToclientmanager() {
    this.searchQuery = '';
    this.router.navigate(['/client-manager']);
  }
}
