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
  accounts: ModelAccount |undefined;
  infoAccounts: ModelInfoAccount |undefined;
  url: string | null = null;
  name: string | null = null;
  idAccount: number | null = null;
  infoAccount: ModelInfoAccount[] = [];
  mangas: ModelManga [] = [];
  CombinedData: CombinedData[] = [];
  ListCombinedDatas: CombinedData[] = [];
  isHidden: boolean = true;
  numberNotification: number | null = null;
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
    this.allFunction()
  }
  allFunction(){
    this.TakeData();
    this. takenewdata()
  }
  mangaFavorite: ModelMangaFavorite[] = [];
  notificationAc:ModelNotificationMangaAccount [] = [];
  takenewdata1(): Promise<void> {
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

  notification:ModelNotification|undefined;
  info :ModelInfoAccount|undefined;
  mangaInfo :ModelManga|undefined;
  takenewdata2(id: number): Observable<ModelNotification> {
    return this.notificationService.getNotificationById(id);
  }
  takenewdata3(id: number): Observable<ModelInfoAccount> {
    return this.infoAccountService.getInfoAccountById(id);
  }
  takenewdata4(id: number): Observable<ModelManga> {
    return this.mangaService.getMangaById(id);
  }
  takenewdata() {
    this.takenewdata1().then(() => {
      const observables = [];

      for (let i = 0; i < this.mangaFavorite.length; i++) {
        observables.push(
          this.notificationMangaAccountService.getNotificationMangaAcById(this.mangaFavorite[i].id_manga).pipe(
            concatMap((notificationAcList: ModelNotificationMangaAccount[]) => {
              return forkJoin(
                notificationAcList.map((notificationAc) =>
                  forkJoin({
                    manga: this.takenewdata4(Number(notificationAc.id_manga)),
                    notification: this.takenewdata2(Number(notificationAc.id_Notification)).pipe(
                      map((notification: ModelNotification | ModelNotification[]) => {
                        // Ensure notification is an object, not an array
                        return Array.isArray(notification) ? notification[0] : notification;
                      })
                    ),
                    account: this.takenewdata3(Number(notificationAc.id_account))
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
            this.ListCombinedDatas.push(combo);
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
      if(this.idAccount==-1) {
        const History = this.el.nativeElement.querySelector('#History');
        const Favorite = this.el.nativeElement.querySelector('#Favorite');
        const clientManager = this.el.nativeElement.querySelector('#clientManager');
        const iconNotification = this.el.nativeElement.querySelector('#iconNotification');
        History.classList.add('hidden');
        Favorite.classList.add('hidden');
        clientManager.classList.add('hidden');
        iconNotification.classList.add('hidden');
      }
      else{
        const Login = this.el.nativeElement.querySelector('#Login');
        Login.classList.add('hidden');
        const Logout = this.el.nativeElement.querySelector('#Logout');
        Logout.classList.remove('hidden');
      }
    }
    if (userId) {
      this.idAccount = parseInt(userId, 10);
      this.accountService.getAccountById( this.idAccount).subscribe(
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



  //delete all notification
  // deleteAllNotification() {
  //   const updateObservables: Observable<ModelNotificationMangaAccount>[] = [];
  //   for (let i = 0; i < this.CombinedData.length; i++) {
  //     const notificationData = {
  //         id_manga: this.CombinedData[i].Mangainfo?.id_manga,
  //         id_account: this.idAccount,
  //         id_Notification: this.CombinedData[i].Notification?.id_Notification,
  //         isGotNotification: true,
  //         is_read: true,
  //       } as ModelNotificationMangaAccount
  //     ;
  //     this.CombinedData = [];
  //     const observable = this.notificationMangaAccountService.updateNotificationAccount(notificationData);
  //     updateObservables.push(observable);
  //   }
  //   forkJoin(updateObservables).subscribe({
  //     next: (responses) => {
  //       responses.forEach((response, index) => {
  //       });
  //       alert("Đã xóa hết thông báo");
  //     },
  //     error: (error) => {
  //       console.error("Đã xảy ra lỗi trong quá trình xóa thông báo:", error);
  //     }
  //   });
  // }

    // }
  goToIndex(): void {
    this.searchQuery=''
    this.router.navigate(['/']);
  }

  goToListView() {
    this.searchQuery='';
    this.router.navigate(['/list-view']);
  }

  goToRank() {
    this.searchQuery='';
    this.router.navigate(['/rank']);
  }

  goToHistory() {
    this.searchQuery='';
    this.router.navigate(['/history']);
  }

  goToFavorite() {
    this.searchQuery='';
    this.router.navigate(['/favorite']);
  }

  goToLogin() {
    this.searchQuery='';
    this.router.navigate(['/login']);
  }

  goToNotification() {
    this.searchQuery='';
    this.isHidden = !this.isHidden;
  }

  goToclientmanager() {
    this.searchQuery='';
    this.router.navigate(['/client-manager']);
  }
}
