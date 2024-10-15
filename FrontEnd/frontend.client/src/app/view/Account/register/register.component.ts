import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService} from '../../../service/Account/account.service';
import {ModelAccount} from "../../../Model/ModelAccount";
import {InfoAccountService} from "../../../service/InfoAccount/info-account.service";
import {ModelInfoAccount} from "../../../Model/ModelInfoAccoutn";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  constructor(private router: Router,
              private accountService: AccountService,
              private InfoAccountService: InfoAccountService,) {
  }

  goToIndex() {
    this.router.navigate(['/']);
  }

  registerAccount(): void {
    const username = document.getElementById('username') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    const passwordaccept = document.getElementById('passwordaccept') as HTMLInputElement;

    const data: ModelAccount = {
      username: username.value,
      password: password.value,
    };

    if (!username.value) {
      alert("Tên người dùng không được để trống");
      return;
    }
    if (!email.value) {
      alert("Email không được để trống");
      return;
    }
    if (!password.value) {
      alert("Mật khẩu không được để trống");
      return;
    }
    if (!passwordaccept.value) {
      alert("Xác nhận mật khẩu không được để trống");
      return;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailPattern.test(email.value)) {
      alert("Email phải có định dạng: example@gmail.com");
      return;
    }

    if (password.value !== passwordaccept.value) {
      alert("Xác nhận mật khẩu khác với mật khẩu");
      return;
    }

    this.accountService.addAccount(data).subscribe({
      next: (response) => {
        if (typeof response === 'number') {
          const infoAccount: ModelInfoAccount = {
            id_account: response,
            name: "Rỗng",
            email: email.value,
          };

          this.InfoAccountService.addInfoAccount(infoAccount).subscribe({
            next: () => {
              alert('Login success');
              localStorage.setItem('userId', response);
              this.router.navigate([`/index/User:${response}`]);
            },
            error: (error) => {
              alert('Failed to add account information. Please try again later.');
              console.error('Error adding account info:', error);
            }
          });
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      },
      error: (err) => {
        alert('An error occurred during login. Please try again later.');
        console.error('Login error:', err);
      }
    });
  }
}
