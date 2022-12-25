/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TRI_AUTH_TOKEN_INTERCEPTOR_FILTER } from '../../auth.options';
import { TriAuthService } from '../auth.service';
import { TriAuthToken } from '../token/token';

@Injectable()
export class TriAuthJWTInterceptor implements HttpInterceptor {

  constructor(private injector: Injector,
              @Inject(TRI_AUTH_TOKEN_INTERCEPTOR_FILTER)
              protected filter: (req: HttpRequest<any>) => boolean) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.filter(req)) {
      return this.authService.isAuthenticatedOrRefresh()
        .pipe(
          switchMap(authenticated => {
            if (authenticated) {
              return this.authService.getToken().pipe(
                switchMap((token: TriAuthToken) => {
                  const JWT = `Bearer ${token.getValue()}`;
                  req       = req.clone({
                    setHeaders: {
                      Authorization: JWT,
                    },
                  });
                  return next.handle(req);
                }),
              );
            } else {
              return next.handle(req);
            }
          }),
        );
    } else {
      return next.handle(req);
    }
  }

  protected get authService(): TriAuthService {
    return this.injector.get(TriAuthService);
  }

}
