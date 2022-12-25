

import { async, inject, TestBed } from '@angular/core/testing';

import { TriAuthSimpleToken, triAuthCreateToken, TriAuthJWTToken } from './token';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from './token-parceler';
import { TRI_AUTH_TOKENS } from '../../auth.options';

describe('token-parceler', () => {

  let tokenParceler: TriAuthTokenParceler;

  const createdAt = new Date(1532350800000);
  const simpleToken = triAuthCreateToken(TriAuthSimpleToken, 'test value', 'strategy', createdAt);
  // tslint:disable-next-line
  const wrappedSimple = `{"name":"${TriAuthSimpleToken.NAME}","ownerStrategyName":"${simpleToken.getOwnerStrategyName()}","createdAt":${simpleToken.getCreatedAt().getTime()},"value":"${simpleToken.getValue()}"}`;
  // tslint:disable-next-line
  const jwtToken = triAuthCreateToken(TriAuthJWTToken, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZXJlbWEuZnIiLCJpYXQiOjE1MzIzNTA4MDAsImV4cCI6MTUzMjQzNzIwMCwic3ViIjoiQWxhaW4gQ0hBUkxFUyIsImFkbWluIjp0cnVlfQ.iICwNqhvg9KPv3_MSg3HCydyAgAYI9mL3ZejLkY11Ck', 'strategy', createdAt);
  // tslint:disable-next-line
  const wrappedJWT = `{"name":"${TriAuthJWTToken.NAME}","ownerStrategyName":"${jwtToken.getOwnerStrategyName()}","createdAt":${jwtToken.getCreatedAt().getTime()},"value":"${jwtToken.getValue()}"}`;
  // tslint:disable-next-line
  const wrappedNonExisting = `{"name":"non-existing","value":"${simpleToken.getValue()}","ownerStrategyName":"${simpleToken.getOwnerStrategyName()}","createdAt":"${createdAt.getTime()}"}`;
  const wrappedInvalid = `{"name":"non-existing"`;

  describe('default configuration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
          { provide: TRI_AUTH_TOKENS, useValue: [TriAuthSimpleToken, TriAuthJWTToken] },
          TriAuthTokenParceler,
        ],
      });
    });

    beforeEach(async(inject(
      [TriAuthTokenParceler],
      (_tokenParceler) => {
        tokenParceler = _tokenParceler;
      },
    )));

    it('wraps simple', () => {
      expect(tokenParceler.wrap(simpleToken))
        .toEqual(wrappedSimple);
    });

    it('wraps jwt', () => {
      expect(tokenParceler.wrap(jwtToken))
        .toEqual(wrappedJWT);
    });

    it('unwraps simple', () => {
      expect(tokenParceler.unwrap(wrappedSimple))
        .toEqual(simpleToken);
    });

    it('unwraps jwt', () => {
      expect(tokenParceler.unwrap(wrappedJWT))
        .toEqual(jwtToken);
    });

    it('unwraps non existing', () => {
      expect(tokenParceler.unwrap(wrappedNonExisting))
        .toEqual(simpleToken);
    });

    it('unwraps invalid', () => {
      const token = tokenParceler.unwrap(wrappedInvalid);
      expect(token.getName())
        .toEqual(simpleToken.getName());
      expect(token.getValue())
        .toEqual('');
    });
  });

  describe('fail configuration', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken },
          { provide: TRI_AUTH_TOKENS, useValue: [] },
          TriAuthTokenParceler,
        ],
      });
    });

    beforeEach(async(inject(
      [TriAuthTokenParceler],
      (_tokenParceler) => {
        tokenParceler = _tokenParceler;
      },
    )));

    it('unwraps jwt to fallback simple as none provided', () => {

      const token = tokenParceler.unwrap(wrappedJWT);
      expect(token.getName())
        .toEqual(simpleToken.getName());

      expect(token.getValue())
        .toEqual(jwtToken.getValue());
    });

  });
});
