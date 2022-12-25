/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Inject, Injectable, InjectionToken } from '@angular/core';

import { triAuthCreateToken, TriAuthToken, TriAuthTokenClass } from './token';
import { TRI_AUTH_TOKENS } from '../../auth.options';

export interface TriTokenPack {
  name: string;
  ownerStrategyName: string;
  createdAt: Number;
  value: string;
}

export const TRI_AUTH_FALLBACK_TOKEN = new InjectionToken<TriAuthTokenClass>('Auth Options');

/**
 * Creates a token parcel which could be stored/restored
 */
@Injectable()
export class TriAuthTokenParceler {

  constructor(@Inject(TRI_AUTH_FALLBACK_TOKEN) private fallbackClass: TriAuthTokenClass,
              @Inject(TRI_AUTH_TOKENS) private tokenClasses: TriAuthTokenClass[]) {
  }

  wrap(token: TriAuthToken): string {
    return JSON.stringify({
      name: token.getName(),
      ownerStrategyName: token.getOwnerStrategyName(),
      createdAt: token.getCreatedAt().getTime(),
      value: token.toString(),
    });
  }

  unwrap(value: string): TriAuthToken {
    let tokenClass: TriAuthTokenClass = this.fallbackClass;
    let tokenValue = '';
    let tokenOwnerStrategyName = '';
    let tokenCreatedAt: Date = null;

    const tokenPack: TriTokenPack = this.parseTokenPack(value);
    if (tokenPack) {
      tokenClass = this.getClassByName(tokenPack.name) || this.fallbackClass;
      tokenValue = tokenPack.value;
      tokenOwnerStrategyName = tokenPack.ownerStrategyName;
      tokenCreatedAt = new Date(Number(tokenPack.createdAt));
    }

    return triAuthCreateToken(tokenClass, tokenValue, tokenOwnerStrategyName, tokenCreatedAt);
  }

  protected getClassByName(name: string): TriAuthTokenClass {
    return this.tokenClasses.find((tokenClass: TriAuthTokenClass) => tokenClass.NAME === name);
  }

  protected parseTokenPack(value: string): TriTokenPack {
    try {
      return JSON.parse(value!) as any;
    } catch (e) { }
    return null;
  }
}
