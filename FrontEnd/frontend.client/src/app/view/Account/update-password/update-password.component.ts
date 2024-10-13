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
  constructor(private router: Router, private accountService: AccountService) {
  }

  accounts: ModelAccount[] = [];

  goToIndex() {
    this.router.navigate(['/']);
  }

  goToForgotpassword() {
    this.router.navigate(['/forgot-password']);
  }

  Takedata() {
    const username = (document.getElementById('userName') as HTMLInputElement).value;
    const password = (document.getElementById('currentPassword') as HTMLInputElement).value;
    const newPassword = (document.getElementById('newPassword') as HTMLInputElement).value;
    const otherPass = (document.getElementById('confirmPassword') as HTMLInputElement).value;
    if(newPassword!=otherPass){
      alert("Mật khẩu xác nhận không khớp")
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
            };

            this.accountService.updateAccount(ac).subscribe({
              next: (response) => {
                if (typeof response === 'number') {
                  alert('Cập nhật thành công');
                } else {
                  alert('Cập nhật thất bại. Vui lòng kiểm tra lại.');
                }
              },
              error: () => {
                alert('Đã có lỗi xảy ra trong quá trình cập nhật. Vui lòng thử lại sau.');
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
