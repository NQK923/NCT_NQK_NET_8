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
  Accounts: ModelAccount[] = [];

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

    goToUpdatepassword()
    {
      this.router.navigate(['/update-password']);
    }


    login()
  :
    void {
      const username = document.getElementById('username') as HTMLInputElement;
      const password = document.getElementById('password') as HTMLInputElement;

      const data
  :
    ModelAccount = {
      id_account: 0,
      username: username.value,
      password: password.value,
      banDate: new Date("2024-10-06T07:15:58.989Z"),
      role: true,
      status: true
    };

    this.accountService.login(data).subscribe({
      next: (response) => {
        if (typeof response === 'number') {
          alert('Login success');
          localStorage.setItem('userId', response);
          this.router.navigate([`/index/User:${response}`]);
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      },
      error: (err) => {
        alert('An error occurred during login. Please try again later.');
      }
    });
  }

  }
