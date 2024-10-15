import {Component, ElementRef, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {AccountService} from "../../../service/Account/account.service";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelDataAccount} from "../../../Model/DataAccount";
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-manager-account',
  templateUrl: './manager-account.component.html',
  styleUrls: ['./manager-account.component.css']
})

export class ManagerAccountComponent implements OnInit {
  accounts: ModelAccount[] = [];
  infoAccounts: ModelInfoAccount[] = [];
  dataAccount : ModelDataAccount[]=[];
  status:boolean  | null = null;
  constructor(private el: ElementRef, private router: Router,private accountService: AccountService,
              private infoAccountservice: InfoAccountService,private snackBar: MatSnackBar) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goTomanager() {
    this.router.navigate(['/manager']);
  }

  goToacount() {
    this.router.navigate(['/manager-account']);
  }

  goTostatiscal() {
    this.router.navigate(['/manager-statiscal']);
  }

  goToComment() {
    this.router.navigate(['/manager-comment']);
  }

  goToBanner() {
    this.router.navigate(['/manager-banner']);
  }

  ngOnInit() {
    this.setupEventListeners();
    this.applyTailwindClasses();
    this.  Takedata();
  }

  setupEventListeners() {
    const button = this.el.nativeElement.querySelector('#buttonAdd');
    const overlay = this.el.nativeElement.querySelector('#overlay');
    const out = this.el.nativeElement.querySelector('#out');

    if (out) {
      out.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    if (button) {
      button.addEventListener('click', () => {
        overlay.classList.toggle('hidden');
      });
    }

    const update = this.el.nativeElement.querySelector('#update');
    const viewupdate = this.el.nativeElement.querySelector('#viewupdate');
    const outs = this.el.nativeElement.querySelector('#outs');

    if (outs) {
      outs.addEventListener('click', () => {
        viewupdate.classList.toggle('hidden');
      });
    }

    if (update) {
      update.addEventListener('click', () => {
        viewupdate.classList.toggle('hidden');
      });
    }
  }

  applyTailwindClasses() {
    const manageStories = this.el.nativeElement.querySelector('#manageStories1');
    if (manageStories) {
      manageStories.classList.add('border-yellow-500', 'text-yellow-500');
    }
  }

  Takedata() {
      this.accountService.getAccount().subscribe(
        (data: ModelAccount[]) => {
          this.accounts = data;
          this.accountService.getinfoAccount().subscribe(
            (data: ModelInfoAccount[]) => {
              this.infoAccounts = data;
              for(let i=0;i<this.accounts.length;i++){
                for(let j=0;j<this.infoAccounts.length;j++){
                  if (this.accounts[i].id_account==this.infoAccounts[j].id_account){
                    this.dataAccount.push(
                      {Account : this.accounts[i],
                      InfoAccount :this.infoAccounts[j]} as ModelDataAccount)
                    break
                  }

                }
              }

            },
            (error) => {
              console.error('Error fetching account info:', error);
            }
          );

        },
        (error) => {
          console.error('Error fetching accounts:', error);
        }
      );

  }
  UpdateStatus(id: any,pass: string, status: any) {
    console.log('meo');
    this.status = !status; // Toggle status

    console.log(this.status);

    const account: ModelAccount = {
      id_account: id,
      password: pass,
      status: this.status
    };

    console.log(account);

    this.accountService.updateAccount(account).subscribe(
      (response) => {
        // Show success message
        this.snackBar.open('Cập nhật thành công!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      },
      (error) => {
        // Show error message
        this.snackBar.open('Cập nhật thất bại!', 'Đóng', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    );
  }

}
