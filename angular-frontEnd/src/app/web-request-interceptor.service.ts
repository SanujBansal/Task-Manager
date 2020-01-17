import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, empty, Subject, observable } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebRequestInterceptor implements HttpInterceptor {
  refreshingToken = false;
  accessTokenRefreshed: Subject<any> = new Subject();
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log(err);
        if (err.status === 401) {
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
    if (this.refreshingToken) {
      return new Observable(observer => {
        this.accessTokenRefreshed.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      this.refreshingToken = true;
      return this.auth.getNewAccessToken().pipe(
        tap(() => {
          this.refreshingToken = false;
          console.log('Access Token Refreshed!');
          this.accessTokenRefreshed.next();
        })
      );
    }
  }

  constructor(private auth: AuthService) {}
}
