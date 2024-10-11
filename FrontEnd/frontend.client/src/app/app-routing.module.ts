import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TitlesComponent} from './view/ViewClient/titles/titles.component';
import {IndexComponent} from './view/ViewClient/index/index.component';
import {ClientManagerComponent} from './view/ViewClient/client-manager/client-manager.component';
import {ListViewComponent} from './view/ViewClient/list-view/list-view.component';
import {HistoryComponent} from './view/ViewClient/history/history.component';
import {FaveriteComponent} from './view/ViewClient/faverite/faverite.component';
import {ViewerComponent} from './view/ViewClient/viewer/viewer.component';
import {RankComponent} from './view/ViewClient/rank/rank.component';

import {ForgotPasswordComponent} from './view/Account/forgot-password/forgot-password.component';
import {LoginComponent} from './view/Account/login/login.component';
import {RegisterComponent} from './view/Account/register/register.component';
import {UpdatePasswordComponent} from './view/Account/update-password/update-password.component';


import {ManagerComponent} from './view/Manager/manager/manager.component';
import {ManagerAccountComponent} from './view/Manager/manager-account/manager-account.component';
import {ManagerStatiscalComponent} from './view/Manager/manager-statiscal/manager-statiscal.component';
import {ManagerCommentComponent} from './view/Manager/manager-comment/manager-comment.component';
import {ManagerBannerComponent} from './view/Manager/manager-banner/manager-banner.component';

const routes: Routes = [
  //view
  {path: '', component: IndexComponent},
  {path: 'index/:idAccount', component: IndexComponent},
  {path: 'titles/:id_manga', component: TitlesComponent},
  {path: 'login', component: LoginComponent},
  {path: 'client-manager', component: ClientManagerComponent},
  {path: 'list-view', component: ListViewComponent},
  {path: 'history', component: HistoryComponent},
  {path: 'faverite', component: FaveriteComponent},
  {path: 'manga/:id_manga/chapter/:index', component: ViewerComponent},
  // {path: 'v', component: ViewerComponent},
  {path: 'rank', component: RankComponent},

  //account
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'update-password', component: UpdatePasswordComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'update-password', component: UpdatePasswordComponent},

  //manager
  {path: 'manager-account', component: ManagerAccountComponent},
  {path: 'manager-statiscal', component: ManagerStatiscalComponent},
  {path: 'manager/:idAccount', component: ManagerComponent},
  {path: 'manager-comment', component: ManagerCommentComponent},
  {path: 'manager-banner', component: ManagerBannerComponent},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {useHash: true}) // Sử dụng HashLocationStrategy
  ],
  exports: [RouterModule],
  // imports: [RouterModule.forRoot(routes)],
  // exports: [RouterModule]
})
export class AppRoutingModule {
}

