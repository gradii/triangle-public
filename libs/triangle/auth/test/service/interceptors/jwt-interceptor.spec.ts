import { Injector } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HTTP_INTERCEPTORS, HttpRequest } from '@angular/common/http';
import { TestBed, async, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of as observableOf } from 'rxjs';

import {
  TRI_AUTH_OPTIONS, TRI_AUTH_STRATEGIES,
  TRI_AUTH_TOKEN_INTERCEPTOR_FILTER,
  TRI_AUTH_TOKENS,
  TRI_AUTH_USER_OPTIONS,
} from '@nebular/auth/auth.options';
import { TriAuthJWTInterceptor, TriAuthService } from '@nebular/auth';
import { TriTokenService } from '@nebular/auth/services/token/token.service';
import { TriTokenLocalStorage, TriTokenStorage } from '@nebular/auth/services/token/token-storage';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from '@nebular/auth/services/token/token-parceler';
import { TriDummyAuthStrategy } from '@nebular/auth';
import { optionsFactory, strategiesFactory } from '@nebular/auth/auth.module';
import { TriAuthJWTToken, TriAuthSimpleToken} from '@nebular/auth/services/token/token';


describe('jwt-interceptor', () => {

  // tslint:disable
  const validJWTValue = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZXJlbWEuZnIiLCJpYXQiOjE1MzIzNTA4MDAsImV4cCI6MjUzMjM1MDgwMCwic3ViIjoiQWxhaW4gQ0hBUkxFUyIsImFkbWluIjp0cnVlfQ.Rgkgb4KvxY2wp2niXIyLJNJeapFp9z3tCF-zK6Omc8c';
  const validJWTToken = new TriAuthJWTToken(validJWTValue, 'dummy');
  const expiredJWTToken = new TriAuthJWTToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzY290Y2guaW8iLCJleHAiOjEzMDA4MTkzODAsIm5hbWUiOiJDaHJpcyBTZXZpbGxlamEiLCJhZG1pbiI6dHJ1ZX0.03f329983b86f7d9a9f5fef85305880101d5e302afafa20154d094b229f75773','dummy');
  const authHeader = 'Bearer ' + validJWTValue;

  let authService: TriAuthService;
  let tokenService: TriTokenService;
  let dummyAuthStrategy: TriDummyAuthStrategy;

  let http: HttpClient;
  let httpMock: HttpTestingController;

  function filterInterceptorRequest(req: HttpRequest<any>): boolean {
    return ['/filtered/url']
      .some(url => req.url.includes(url));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule],
      providers: [
         { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
         { provide: TRI_AUTH_TOKENS, useValue: [TriAuthJWTToken] },
        TriAuthTokenParceler,
         {
          provide: TRI_AUTH_USER_OPTIONS, useValue: {
            strategies: [
              TriDummyAuthStrategy.setup({
                alwaysFail: false,
                name: 'dummy',
              }),
            ],
          },
        },
        { provide: TRI_AUTH_OPTIONS, useFactory: optionsFactory, deps: [TRI_AUTH_USER_OPTIONS] },
        { provide: TRI_AUTH_STRATEGIES, useFactory: strategiesFactory, deps: [TRI_AUTH_OPTIONS, Injector] },
        { provide: TriTokenStorage, useClass: TriTokenLocalStorage },
        { provide: HTTP_INTERCEPTORS, useClass: TriAuthJWTInterceptor, multi: true },
        { provide: TRI_AUTH_TOKEN_INTERCEPTOR_FILTER, useValue: filterInterceptorRequest },
        TriTokenService,
        TriAuthService,
        TriDummyAuthStrategy,
      ],
    });
    authService = TestBed.inject(TriAuthService);
    tokenService = TestBed.inject(TriTokenService);
    dummyAuthStrategy = TestBed.inject(TriDummyAuthStrategy);
  });

    beforeEach(async(
      inject([HttpClient, HttpTestingController], (_httpClient, _httpMock) => {
        http = _httpClient;
        httpMock = _httpMock;
      }),
    ));

    it ('Url filtered, isAuthenticatedOrRefresh not called, token not added', () => {
      const spy = spyOn(authService, 'isAuthenticatedOrRefresh');
      http.get('/filtered/url/').subscribe(res => {
        expect(spy).not.toHaveBeenCalled();
      });
      httpMock.expectOne(
        req => req.url === '/filtered/url/'
          && ! req.headers.get('Authorization'),
      ).flush({});
    });

    it ('Url not filtered, isAuthenticatedOrRefresh called, authenticated, token added', () => {
      const spy = spyOn(authService, 'isAuthenticatedOrRefresh')
        .and.
        returnValue(observableOf(true));
      spyOn(authService, 'getToken')
        .and
        .returnValue(observableOf(validJWTToken));
      http.get('/notfiltered/url/').subscribe(res => {
        expect(spy).toHaveBeenCalled();
      });
      httpMock.expectOne(
        req => req.url === '/notfiltered/url/'
          && req.headers.get('Authorization') === authHeader,
      ).flush({});
    });

    it ('Url not filtered, isAuthenticatedOrRefresh called, not authenticated, token not added', () => {
      const spy = spyOn(authService, 'isAuthenticatedOrRefresh')
        .and.
        returnValue(observableOf(false));
      spyOn(authService, 'getToken')
        .and
        .returnValue(observableOf(expiredJWTToken));
      http.get('/notfiltered/url/').subscribe(res => {
        expect(spy).toHaveBeenCalled();
      });
      httpMock.expectOne(
        req => req.url === '/notfiltered/url/'
          && ! req.headers.get('Authorization'),
      ).flush({});
    });

  },
);
