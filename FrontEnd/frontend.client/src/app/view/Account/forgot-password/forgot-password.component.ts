import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from "../../../service/Account/account.service";
import {ModelAccount} from "../../../Model/ModelAccount";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccount";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  accounts: ModelAccount[] = [];
  infoaccount: ModelInfoAccount[] = [];

  constructor(private router: Router, private accountService: AccountService,private  InfoAccountService: InfoAccountService) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  takePassWord() {
    const username = (document.getElementById('usernameInput') as HTMLInputElement).value; // Giả sử ID đúng
    const email = (document.getElementById('emailInput') as HTMLInputElement).value; // Đảm bảo ID đúng
    let password: string | null = null; // Khai báo password là null

    // Lấy danh sách tài khoản
    this.accountService.getAccount().subscribe(
      (accountsData: ModelAccount[]) => {
        this.accounts = accountsData;

        // Lấy thông tin tài khoản
        this.InfoAccountService.getinfoaccount().subscribe(
          (infoData: ModelInfoAccount[]) => {
            this.infoaccount = infoData;

            // Kiểm tra email
            const emailExists = this.infoaccount.some(info => info.email === email);
            if (!emailExists) {
              alert('Email không đúng');
              return;
            }

            // Tìm kiếm tài khoản dựa trên tên người dùng
            const account = this.accounts.find(acc => acc.username === username);
            if (account) {
              password = account.password;
              if (password) {
                // Gửi mật khẩu đến email
                this.accountService.postPassword(email, password).subscribe({
                  next: (response) => {

                    alert('Thành công! Vui lòng kiểm tra email để lấy mật khẩu.');
                  },
                  error: (error) => {
                    alert('Có lỗi xảy ra khi gửi mật khẩu.');
                  }
                });
              } else {
                alert('Mật khẩu không tồn tại cho tài khoản này.');
              }
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
}
