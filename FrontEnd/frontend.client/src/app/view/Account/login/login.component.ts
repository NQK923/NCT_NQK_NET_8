import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from '../../../service/Account/account.service';
import {ModelAccount} from '../../../Model/ModelAccount';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  accounts: ModelAccount[] = [];

  constructor(private router: Router, private accountService: AccountService) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }


  goToForgotpassword() {
    this.router.navigate(['/forgot-password']);
  }


  goToRegister() {
    this.router.navigate(['/register']);
  }


  goToUpdatepassword() {
    this.router.navigate(['/update-password']);
  }


  login(): void {
    const username = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const data: ModelAccount = {
      id_account: 0,
      username: username,
      password: password,
      banDate: new Date("2024-10-06T07:15:58.989Z"),
      role: true,
      status: true
    };

    this.accountService.login(data).subscribe({
      next: (response) => {
        if (typeof response === 'number') {
          this.Takedata(response); // Gọi hàm Takedata và truyền response
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      },
      error: () => {
        alert('An error occurred during login. Please try again later.');
      }
    });
  }

  Takedata(response: number) {
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
        console.log(this.accounts.length);
        this.checkAccount(response);
      },
      (error) => {
        console.error('Error fetching accounts:', error);
      }
    );
  }

  checkAccount(response: number) {
    for (let i = 0; i < this.accounts.length; i++) {
      if (this.accounts[i].id_account === response) {
        if (this.accounts[i].role === true && this.accounts[i].status === true) {
          alert('Login success');
          localStorage.setItem('userId', response.toString());
          this.router.navigate([`/index/User:${response}`]);

        } else if (this.accounts[i].status != true) {
          alert('Tài khoản đã bị khóa, liên hệ quản lý để hổ trợ');
        } else if (this.accounts[i].role === false) {
          alert('Login success');
          this.router.navigate([`/manager/User:${response}`]);
        }

      }
    }
  }
}
