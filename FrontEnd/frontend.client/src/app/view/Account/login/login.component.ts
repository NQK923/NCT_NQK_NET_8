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


  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }


  goToRegister() {
    this.router.navigate(['/register']);
  }


  goToUpdatePassword() {
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
        this.TakeData(Number(response));
      },
      error: () => {
        alert('An error occurred during login. Please try again later.');
      }
    });
  }

  TakeData(response: number) {
    this.accountService.getAccount().subscribe(
      (data: ModelAccount[]) => {
        this.accounts = data;
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
        if (!this.accounts[i].role && !this.accounts[i].status) {
          alert('Login success');
          localStorage.setItem('userId', response.toString());
          this.router.navigate([`/index/User:${response}`]);

        } else if (this.accounts[i].status) {
          alert('Tài khoản đã bị khóa, liên hệ quản lý để hổ trợ');
        } else if (this.accounts[i].role) {
          alert('Login success');
          this.router.navigate(['/manager']);
        }

      }
    }
  }
}
