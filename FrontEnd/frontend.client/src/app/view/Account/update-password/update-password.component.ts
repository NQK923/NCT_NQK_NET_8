import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ModelAccount} from "../../../Model/ModelAccount";
import {AccountService} from "../../../service/Account/account.service";

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent {
  accounts: ModelAccount[] = [];

  constructor(private router: Router, private accountService: AccountService) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  TakeData() {
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    if (newPassword != otherPass) {
      alert("Mật khẩu xác nhận không khớp")
      return
    }
    if (newPassword == "" && otherPass == "") {
      alert("Vui lòng nhập đủ ")
      return
    }
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        let accountFound = false;
        for (let i = 0; i < this.accounts.length; i++) {
          if (this.accounts[i].username === username) {
            accountFound = true;
            if (this.accounts[i].password !== password) {
              alert("Sai mật khẩu");
              return;
            }
            const ac: ModelAccount = {
              id_account: this.accounts[i].id_account,
              username: this.accounts[i].username,
              password: newPassword,
              status: false,
              banComment: false,
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

        if (!accountFound) {
          alert("Tài khoản không tồn tại.");
        }
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }
}
