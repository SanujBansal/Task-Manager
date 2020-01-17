import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}
  action;
  ngOnInit() {
    if (this.router.url.includes('login')) {
      this.action = 'Login';
    } else {
      this.action = 'Sign Up';
    }
  }
  login(email, password) {
    if (this.action === 'Login') {
      this.auth.login(email, password).subscribe(res => {
        if (res.ok) {
          this.router.navigate(['']);
        }
      });
    } else {
      this.auth.signUp(email, password).subscribe(res => {
        if (res.ok) {
          this.router.navigate(['']);
        }
      });
    }
  }
}
