import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { shareReplay, tap } from 'rxjs/operators';
import { HttpResponse, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private webRequest: WebRequestService,
    private router: Router,
    private http: HttpClient
  ) {}
  login(email, password) {
    return this.webRequest.login(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        this.setSession(
          res.body._id,
          res.headers.get('x-access-token'),
          res.headers.get('x-refresh-token')
        );
      })
    );
  }
  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }
  getUserId() {
    return localStorage.getItem('user-id');
  }
  setAccessToken(accessToken) {
    localStorage.setItem('x-access-token', accessToken);
  }
  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }
  private setSession(id, accessToken, refreshToken) {
    localStorage.setItem('user-id', id);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }
  private removeSession() {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
  }
  logout() {
    this.removeSession();
    this.router.navigate(['/login']);
  }
  getNewAccessToken() {
    return this.http
      .get(`${this.webRequest.ROOT_URL}/users/me/access-token`, {
        headers: {
          'x-refresh-token': this.getRefreshToken(),
          _id: this.getUserId()
        },
        observe: 'response'
      })
      .pipe(
        tap((res: HttpResponse<any>) => {
          this.setAccessToken(res.headers.get('x-access-token'));
        })
      );
  }
}
