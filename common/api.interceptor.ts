import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class APIInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );

  excludeUrl = [
    '/Account/login',
    '/User/UserDetails',
    '/ArchivedRequest/IsRequestCompleted',
  ];

  constructor(
    public authService: AuthService,
    public cookieService: CookieService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token = this.authService.getToken();
    let archiveFlag = this.cookieService.get('useArchive');
    if (token) {
      request = this.addToken(request, token);
    }

    request = request.clone({
      headers: request.headers.set('Accept', 'application/json'),
    });

    let exludeFound = this.excludeUrl.filter((element) => {
      return request.url.includes(element);
    });

    if (
      !(exludeFound && exludeFound.length > 0) &&
      !(request.body instanceof FormData) &&
      !request.url.includes('stripe')
    ) {
      request = request.clone({
        headers: request.headers.set('useArchive', archiveFlag),
      });
    }

    if (
      !(request.body instanceof FormData) &&
      !request.url.includes('stripe')
    ) {
      request = request.clone({
        headers: request.headers.set('Content-Type', 'application/json'),
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/Account/login')) {
          const [domainUrl, apiPath] = request?.url.split('/api/');
          if (apiPath === 'auth/refreshToken') {
            this.authService.logout();
          } else {
            return this.handle401Error(request, next);
          }
          // return this.handle401Error(request, next);
          return throwError(null);
        } else {
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      this.authService.collectFailedRequest(request);

      return this.authService.refreshToken().pipe(
        switchMap((tokenResponse: any) => {
          this.isRefreshing = false;
          this.authService.updateTokenInfo(tokenResponse.data);
          this.refreshTokenSubject.next(tokenResponse.data.token);
          this.authService.retryFailedRequests();
          return next.handle(this.addToken(request, tokenResponse.data.token));
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token != null),
        take(1),
        switchMap((token) => next.handle(this.addToken(request, token)))
      );
    }
  }
}
