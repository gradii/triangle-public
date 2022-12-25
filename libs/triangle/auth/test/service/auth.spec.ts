

import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { of as observableOf } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { TRI_AUTH_OPTIONS, TRI_AUTH_USER_OPTIONS, TRI_AUTH_STRATEGIES, TRI_AUTH_TOKENS } from '../auth.options';
import { TriAuthService } from './auth.service';
import { TriDummyAuthStrategy } from '../strategies/dummy/dummy-strategy';
import { nbStrategiesFactory, nbOptionsFactory } from '../auth.module';
import { TriAuthResult } from './auth-result';
import { TriTokenService } from './token/token.service';
import { TriAuthSimpleToken, triAuthCreateToken, TriAuthJWTToken } from './token/token';
import { TriTokenLocalStorage, TriTokenStorage } from './token/token-storage';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from './token/token-parceler';

describe('auth-service', () => {
  let authService: TriAuthService;
  let tokenService: TriTokenService;
  let dummyAuthStrategy: TriDummyAuthStrategy;
  const testTokenValue = 'test-token';
  const ownerStrategyName = 'dummy';


  const resp401 = new HttpResponse<Object>({body: {}, status: 401});
  const resp200 = new HttpResponse<Object>({body: {}, status: 200});

  const testToken = triAuthCreateToken(TriAuthSimpleToken, testTokenValue, ownerStrategyName);
  const invalidToken = triAuthCreateToken(TriAuthSimpleToken, testTokenValue, ownerStrategyName);
  const emptyToken = triAuthCreateToken(TriAuthSimpleToken, null, null);

  const failResult = new TriAuthResult(false,
    resp401,
    null,
    ['Something went wrong.']);

  const successResult = new TriAuthResult(true,
    resp200,
    '/',
    [],
    ['Successfully logged in.'],
    testToken);

  const successLogoutResult = new TriAuthResult(true,
    resp200,
    '/',
    [],
    ['Successfully logged out.']);

  const successResetPasswordResult = new TriAuthResult(true,
    resp200,
    '/',
    [],
    ['Successfully reset password.']);

  const successRequestPasswordResult = new TriAuthResult(true,
    resp200,
    '/',
    [],
    ['Successfully requested password.']);

  const successRefreshTokenResult = new TriAuthResult(true,
    resp200,
    null,
    [],
    ['Successfully refreshed token.'],
    testToken);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TRI_AUTH_OPTIONS, useValue: {} },
        { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
        { provide: TRI_AUTH_TOKENS, useValue: [TriAuthSimpleToken, TriAuthJWTToken] },
        TriAuthTokenParceler,
        {
          provide: TRI_AUTH_USER_OPTIONS, useValue: {
            forms: {
              login: {
                redirectDelay: 3000,
              },
            },
            strategies: [
              TriDummyAuthStrategy.setup({
                name: 'dummy',

                alwaysFail: true,
                delay: 1000,
              }),
            ],
          },
        },
        { provide: TRI_AUTH_OPTIONS, useFactory: nbOptionsFactory, deps: [TRI_AUTH_USER_OPTIONS] },
        { provide: TRI_AUTH_STRATEGIES, useFactory: nbStrategiesFactory, deps: [TRI_AUTH_OPTIONS, Injector] },
        { provide: TriTokenStorage, useClass: TriTokenLocalStorage },
        TriTokenService,
        TriAuthService,
        TriDummyAuthStrategy,
      ],
    });
    authService = TestBed.inject(TriAuthService);
    tokenService = TestBed.inject(TriTokenService);
    dummyAuthStrategy = TestBed.inject(TriDummyAuthStrategy);
  });

  it('get test token before set', () => {
      const spy = spyOn(tokenService, 'get')
        .and
        .returnValue(observableOf(testToken));

      authService.getToken().subscribe((val: TriAuthSimpleToken) => {
        expect(spy).toHaveBeenCalled();
        expect(val.getValue()).toEqual(testTokenValue);
      });
    },
  );

  it('is authenticated true if token exists', () => {
      const spy = spyOn(tokenService, 'get')
        .and
        .returnValue(observableOf(testToken));

      authService.isAuthenticated().subscribe((isAuth: boolean) => {
        expect(spy).toHaveBeenCalled();
        expect(isAuth).toBeTruthy();
      });
    },
  );

  it('is authenticated false if token doesn\'t exist', () => {
      const spy = spyOn(tokenService, 'get')
        .and
        .returnValue(observableOf(emptyToken));

      authService.isAuthenticated().subscribe((isAuth: boolean) => {
        expect(spy).toHaveBeenCalled();
        expect(isAuth).toBeFalsy();
      });
    },
  );

  it('isAuthenticatedOrRefresh, token valid, strategy refreshToken not called, returns true', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'refreshToken');

      spyOn(tokenService, 'get')
        .and
        .returnValue(observableOf(testToken));

      authService.isAuthenticatedOrRefresh()
        .pipe(first())
        .subscribe((isAuth: boolean) => {
          expect(spy).not.toHaveBeenCalled();
          expect(isAuth).toBeTruthy();
          done();
        });
    },
  );

  it('isAuthenticatedOrRefresh, token invalid, strategy refreshToken called, returns true', (done) => {

      spyOn(invalidToken, 'isValid')
        .and
        .returnValue(false);

      const spy = spyOn(dummyAuthStrategy, 'refreshToken')
        .and
        .returnValue(observableOf(successResult));

      spyOn(tokenService, 'get')
        .and
        .returnValues(observableOf(invalidToken), observableOf(testToken));

      authService.isAuthenticatedOrRefresh()
        .pipe(first())
        .subscribe((isAuth: boolean) => {
          expect(spy).toHaveBeenCalled();
          expect(isAuth).toBeTruthy();
          done();
        });
    },
  );

  it('isAuthenticatedOrRefresh, token invalid, strategy refreshToken called, returns false', (done) => {

      spyOn(invalidToken, 'isValid')
        .and
        .returnValue(false);

      const spy = spyOn(dummyAuthStrategy, 'refreshToken')
        .and
        .returnValue(observableOf(failResult));

      spyOn(tokenService, 'get')
        .and
        .returnValues(observableOf(invalidToken), observableOf(invalidToken));

      authService.isAuthenticatedOrRefresh()
        .pipe(first())
        .subscribe((isAuth: boolean) => {
          expect(spy).toHaveBeenCalled();
          expect(isAuth).toBeFalsy();
          done();
        });
    },
  );

  it('isAuthenticatedOrRefresh, token doesn\'t exist, strategy refreshToken called, returns false', (done) => {
      const spy = spyOn(tokenService, 'get')
        .and
        .returnValue(observableOf(emptyToken));

      authService.isAuthenticatedOrRefresh()
        .pipe(first())
        .subscribe((isAuth: boolean) => {
          expect(spy).toHaveBeenCalled();
          expect(isAuth).toBeFalsy();
          done();
        });
    },
  );

  it('onTokenChange return correct stream and gets test token', (done) => {
      const spy = spyOn(tokenService, 'tokenChange')
        .and
        .returnValue(observableOf(testToken));

      authService.onTokenChange()
        .pipe(first())
        .subscribe((token: TriAuthSimpleToken) => {
          expect(spy).toHaveBeenCalled();
          expect(token.getValue()).toEqual(testTokenValue);
          done();
        });
    },
  );

  it('authenticate failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'authenticate')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.authenticate(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();
        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('authenticate succeed', (done) => {
      const strategySpy = spyOn(dummyAuthStrategy, 'authenticate')
        .and
        .returnValue(observableOf(successResult)
          .pipe(
            delay(1000),
          ));

      const tokenServiceSetSpy = spyOn(tokenService, 'set')
        .and
        .returnValue(observableOf(null));


      authService.authenticate(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategySpy).toHaveBeenCalled();
        expect(tokenServiceSetSpy).toHaveBeenCalled();


        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully logged in.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toEqual('/');
        expect(authRes.getToken()).toEqual(testToken);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );

  it('register failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'register')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.register(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();
        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('register succeed', (done) => {
      const strategySpy = spyOn(dummyAuthStrategy, 'register')
        .and
        .returnValue(observableOf(successResult)
          .pipe(
            delay(1000),
          ));

      const tokenServiceSetSpy = spyOn(tokenService, 'set')
        .and
        .returnValue(observableOf(null));

      authService.register(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategySpy).toHaveBeenCalled();
        expect(tokenServiceSetSpy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully logged in.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toEqual('/');
        expect(authRes.getToken()).toEqual(testToken);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );

  it('logout failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'logout')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.logout(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('logout succeed', (done) => {
      const strategyLogoutSpy = spyOn(dummyAuthStrategy, 'logout')
        .and
        .returnValue(observableOf(successLogoutResult)
          .pipe(
            delay(1000),
          ));
      const tokenServiceClearSpy = spyOn(tokenService, 'clear').and.returnValue(observableOf('STUB'));

      authService.logout(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategyLogoutSpy).toHaveBeenCalled();
        expect(tokenServiceClearSpy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully logged out.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toEqual('/');
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );

  it('requestPassword failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'requestPassword')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.requestPassword(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('requestPassword succeed', (done) => {
      const strategyLogoutSpy = spyOn(dummyAuthStrategy, 'requestPassword')
        .and
        .returnValue(observableOf(successRequestPasswordResult)
          .pipe(
            delay(1000),
          ));

      authService.requestPassword(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategyLogoutSpy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully requested password.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toEqual('/');
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );

  it('resetPassword failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'resetPassword')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.resetPassword(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('resetPassword succeed', (done) => {
      const strategyLogoutSpy = spyOn(dummyAuthStrategy, 'resetPassword')
        .and
        .returnValue(observableOf(successResetPasswordResult)
          .pipe(
            delay(1000),
          ));

      authService.resetPassword(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategyLogoutSpy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully reset password.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toEqual('/');
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );

  it('refreshToken failed', (done) => {
      const spy = spyOn(dummyAuthStrategy, 'refreshToken')
        .and
        .returnValue(observableOf(failResult)
          .pipe(
            delay(1000),
          ));

      authService.refreshToken(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(spy).toHaveBeenCalled();
        expect(authRes.isFailure()).toBeTruthy();
        expect(authRes.isSuccess()).toBeFalsy();
        expect(authRes.getMessages()).toEqual([]);
        expect(authRes.getErrors()).toEqual(['Something went wrong.']);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toBe(null);
        expect(authRes.getResponse()).toEqual(resp401);
        done();
      });
    },
  );

  it('refreshToken succeed', (done) => {
      const strategySpy = spyOn(dummyAuthStrategy, 'refreshToken')
        .and
        .returnValue(observableOf(successRefreshTokenResult)
          .pipe(
            delay(1000),
          ));

      const tokenServiceSetSpy = spyOn(tokenService, 'set')
        .and
        .returnValue(observableOf(null));

      authService.refreshToken(ownerStrategyName).subscribe((authRes: TriAuthResult) => {
        expect(strategySpy).toHaveBeenCalled();
        expect(tokenServiceSetSpy).toHaveBeenCalled();

        expect(authRes.isFailure()).toBeFalsy();
        expect(authRes.isSuccess()).toBeTruthy();
        expect(authRes.getMessages()).toEqual(['Successfully refreshed token.']);
        expect(authRes.getErrors()).toEqual([]);
        expect(authRes.getRedirect()).toBeNull();
        expect(authRes.getToken()).toEqual(testToken);
        expect(authRes.getResponse()).toEqual(resp200);
        done();
      });
    },
  );
});
