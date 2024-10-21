import {Component, ElementRef} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from "../../../service/Account/account.service";
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  accounts: ModelAccount[] = [];
  infoAccount: ModelInfoAccount[] = [];
  code: string | null = null;

  constructor(private el: ElementRef, private router: Router, private accountService: AccountService, private InfoAccountService: InfoAccountService) {
  }

  //go to home page
  goToIndex() {
    this.router.navigate(['/']);
  }

  //Create OTP
  generateRandomNumbers() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  //Forgot password
  takePassWord() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
    const email = (document.getElementById('emailInput') as HTMLInputElement).value;
    let password: string | null = null;

    this.accountService.getAccount().subscribe(
      (accountsData: ModelAccount[]) => {
        this.accounts = accountsData;
        this.InfoAccountService.getinfoaccount().subscribe(
          (infoData: ModelInfoAccount[]) => {
            this.infoAccount = infoData;
            const emailExists = this.infoAccount.some(info => info.email === email);
            if (!emailExists) {
              alert('Email không đúng');
              return;
            }
            const account = this.accounts.find(acc => acc.username === username);
            if (account) {
              const randomNumbers = this.generateRandomNumbers();
              localStorage.setItem('code', randomNumbers.toString());
              const text: string = "Mã xác nhận";
              this.accountService.postMail(email, text.toString(), randomNumbers.toString()).subscribe({
                next: (response) => {
                  alert('Thành công! Vui lòng kiểm tra email để lấy mã đổi mật khẩu.');
                  const overlay = this.el.nativeElement.querySelector('#updatePassWord');
                  overlay.classList.toggle('hidden');
                },
                error: (error) => {
                  alert('Có lỗi xảy ra khi gửi mật khẩu.');
                }
              });
            } else {
              alert('Tên người dùng không tồn tại.');
            }
          },
          (error) => {
            console.error('Error fetching account info:', error);
            alert('Có lỗi xảy ra khi lấy thông tin tài khoản.');
          }
        );
      },
      (error) => {
        console.error('Error fetching accounts:', error);
        alert('Có lỗi xảy ra khi lấy danh sách tài khoản.');
      }
    );
  }

  //Create new password
  update() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const codeHtml = (document.getElementById('code') as HTMLInputElement).value;
    this.code = localStorage.getItem('code');
    if (this.code != codeHtml) {
      alert(" Sai mã ")
      return
    }
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        for (let i = 0; i < this.accounts.length; i++) {
          if (this.accounts[i].username === username) {
            const ac: ModelAccount = {
              id_account: this.accounts[i].id_account,
              username: this.accounts[i].username,
              password: newPassword,
              status: false,
              banComment: false
            };
            this.accountService.updateAccount(ac).subscribe({
              next: (response) => {
                alert('Cập nhật tài khoản thành công:');
                this.router.navigate(['/login']);
              },
              error: (err) => {
                console.error('Có lỗi xảy ra khi cập nhật tài khoản:', err);

              }
            });
            break;
          }
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

}
