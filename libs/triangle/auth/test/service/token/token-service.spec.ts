

import { async, inject, TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

import { TriTokenLocalStorage, TriTokenStorage } from './token-storage';
import { TriAuthSimpleToken, TriAuthToken, triAuthCreateToken } from './token';
import { TriTokenService } from './token.service';
import { TriAuthJWTToken } from '@nebular/auth/services/token/token';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from './token-parceler';
import { TRI_AUTH_TOKENS } from '../../auth.options';

const noop = () => {};
const ownerStrategyName = 'strategy';

describe('token-service', () => {

  let tokenService: TriTokenService;
  let tokenStorage: TriTokenLocalStorage;
  const simpleToken = triAuthCreateToken(TriAuthSimpleToken, 'test value', ownerStrategyName);
  const emptyToken = triAuthCreateToken(TriAuthSimpleToken, '', ownerStrategyName);
  const testTokenKey = 'auth_app_token';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TriTokenStorage, useClass: TriTokenLocalStorage },
        { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
        { provide: TRI_AUTH_TOKENS, useValue: [TriAuthSimpleToken, TriAuthJWTToken] },
        TriAuthTokenParceler,
        TriTokenService,
      ],
    });
  });

    beforeEach(async(inject(
    [TriTokenService, TriTokenStorage],
    (_tokenService, _tokenStorage) => {
      tokenService = _tokenService;
      tokenStorage = _tokenStorage;
    },
  )));

  afterEach(() => {
    localStorage.removeItem(testTokenKey);
  });

  it('set calls storage set', () => {

    const spy = spyOn(tokenStorage, 'set')
      .and
      .returnValue(null);

    tokenService.set(simpleToken).subscribe(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('get return null in case token was not set', () => {

    const spy = spyOn(tokenStorage, 'get')
      .and
      .returnValue(emptyToken);

    tokenService.get()
      .subscribe((token: TriAuthToken) => {
        expect(spy).toHaveBeenCalled();
        expect(token.getValue()).toEqual('');
        expect(token.isValid()).toBe(false);
      });
  });

  it('should return correct value', () => {
    tokenService.set(simpleToken).subscribe(noop);

    tokenService.get()
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual(simpleToken.getValue());
      });
  });

  it('clear remove token', () => {

    const spy = spyOn(tokenStorage, 'clear')
      .and
      .returnValue(null);

    tokenService.set(simpleToken).subscribe(noop);

    tokenService.clear().subscribe(() => {
      expect(spy).toHaveBeenCalled();
    });
  });

  it('token should be published', (done) => {
    tokenService.tokenChange()
      .pipe(take(1))
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual('');
      });
    tokenService.set(simpleToken).subscribe(noop);
    tokenService.tokenChange()
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual(simpleToken.getValue());
        done();
      });
  });

  it('clear should be published', (done) => {
    tokenService.tokenChange()
      .pipe(take(1))
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual('');
      });
    tokenService.set(simpleToken).subscribe(noop);
    tokenService.tokenChange()
      .pipe(take(1))
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual(simpleToken.getValue());
      });
    tokenService.clear().subscribe(noop);
    tokenService.tokenChange()
      .subscribe((token: TriAuthToken) => {
        expect(token.getValue()).toEqual('');
        done();
      });
  });
});
