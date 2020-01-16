import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, empty } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebRequestInterceptor implements HttpInterceptor {
  refreshingToken = false;
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log(err);
        if (err.status === 401 && !this.refreshingToken) {
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request);
              return next.handle(request);
            }),
            catchError((err: any) => {
              console.log(err);
              this.auth.logout();
              return empty();
            })
          );
        }
        return throwError(err);
      })
    );
  }
  addAuthHeader(request: HttpRequest<any>) {
    const token = this.auth.getAccessToken();
    if (token) {
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      });
    }
    return request;
  }
  refreshAccessToken() {
    this.refreshingToken = true;
    return this.auth.getNewAccessToken().pipe(
      tap(() => {
        this.refreshingToken = false;
        console.log('Access Token Refreshed!');
      })
    );
  }
  constructor(private auth: AuthService) {}
}
