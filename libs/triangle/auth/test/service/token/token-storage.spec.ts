

import { async, inject, TestBed } from '@angular/core/testing';

import { TriTokenLocalStorage, TriTokenStorage } from './token-storage';
import { TRI_AUTH_TOKENS } from '../../auth.options';
import { TriAuthSimpleToken, triAuthCreateToken } from './token';
import { TriAuthJWTToken } from '@nebular/auth/services/token/token';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from './token-parceler';

describe('token-storage', () => {

  let tokenStorage: TriTokenStorage;
  let tokenParceler: TriAuthTokenParceler;
  const testTokenKey = 'auth_app_token';
  const testTokenValue = 'test-token';
  const ownerStrategyName = 'strategy';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TriTokenStorage, useClass: TriTokenLocalStorage },
        { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
        { provide: TRI_AUTH_TOKENS, useValue: [TriAuthSimpleToken, TriAuthJWTToken] },
        TriAuthTokenParceler,
      ],
    });
  });

    beforeEach(async(inject(
    [TriTokenStorage, TriAuthTokenParceler],
    (_tokenStorage, _tokenParceler) => {
      tokenStorage = _tokenStorage;
      tokenParceler = _tokenParceler;
    },
  )));

  afterEach(() => {
    localStorage.removeItem(testTokenKey);
  });


  it('set test token', () => {
    const token = triAuthCreateToken(TriAuthSimpleToken, testTokenValue, ownerStrategyName);

    tokenStorage.set(token);
    expect(localStorage.getItem(testTokenKey)).toEqual(tokenParceler.wrap(token));
  });

  it('setter set invalid token to localStorage as empty string', () => {
    let token;

    token = triAuthCreateToken(TriAuthSimpleToken, null, ownerStrategyName);
    tokenStorage.set(token);
    expect(localStorage.getItem(testTokenKey)).toEqual(tokenParceler.wrap(token));

    token = triAuthCreateToken(TriAuthSimpleToken, undefined, ownerStrategyName);
    tokenStorage.set(token);
    expect(localStorage.getItem(testTokenKey)).toEqual(tokenParceler.wrap(token));
  });

  it('get return null in case token was not set', () => {
    const token = tokenStorage.get();
    expect(token.getValue()).toBe('');
    expect(token.isValid()).toBe(false);
  });

  it('should return correct value', () => {
    const token = triAuthCreateToken(TriAuthSimpleToken, 'test', ownerStrategyName);
    localStorage.setItem(testTokenKey, tokenParceler.wrap(token));

    expect(tokenStorage.get().getValue()).toEqual(token.getValue());
  });

  it('clear remove token', () => {
    const token = triAuthCreateToken(TriAuthSimpleToken, 'test', ownerStrategyName);
    localStorage.setItem(testTokenKey, tokenParceler.wrap(token));

    tokenStorage.clear();

    expect(localStorage.getItem(testTokenKey)).toBeNull();
  });

  it('clear remove token only', () => {
    const token = triAuthCreateToken(TriAuthSimpleToken, 'test', ownerStrategyName);
    localStorage.setItem(testTokenKey, tokenParceler.wrap(token));
    localStorage.setItem(testTokenKey + '2', tokenParceler.wrap(token));

    tokenStorage.clear();

    expect(localStorage.getItem(testTokenKey + '2')).toEqual(tokenParceler.wrap(token));
    expect(localStorage.getItem(testTokenKey)).toBeNull();
  });
});
