/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import {
  TRI_AUTH_INTERCEPTOR_HEADER, TRI_AUTH_OPTIONS, TRI_AUTH_STRATEGIES, TRI_AUTH_TOKEN_INTERCEPTOR_FILTER, TRI_AUTH_TOKENS,
  TRI_AUTH_USER_OPTIONS, TriAuthOptions,
} from './auth.options';
import { noOpInterceptorFilter, optionsFactory, strategiesFactory, tokensFactory } from './factory';

import { TriAuthService } from './services/auth.service';
import { TriAuthSimpleToken } from './services/token/token';
import { TRI_AUTH_FALLBACK_TOKEN, TriAuthTokenParceler } from './services/token/token-parceler';
import { TriTokenLocalStorage, TriTokenStorage } from './services/token/token-storage';
import { TriTokenService } from './services/token/token.service';
import { TriDummyAuthStrategy } from './strategies/dummy/dummy-strategy';
import { TriOAuth2AuthStrategy } from './strategies/oauth2/oauth2-strategy';
import { TriPasswordAuthStrategy } from './strategies/password/password-strategy';

/**
 * # Auth
 *
 *
 */
@NgModule({
  imports     : [
    CommonModule,

    RouterModule,
    FormsModule,
  ],
  declarations: [],
  exports     : [],
})
export class TriAuthModule {
  static forRoot(triAuthOptions?: TriAuthOptions): ModuleWithProviders<TriAuthModule> {
    return {
      ngModule : TriAuthModule,
      providers: [
        {provide: TRI_AUTH_USER_OPTIONS, useValue: triAuthOptions},
        {provide: TRI_AUTH_OPTIONS, useFactory: optionsFactory, deps: [TRI_AUTH_USER_OPTIONS]},
        {
          provide   : TRI_AUTH_STRATEGIES,
          useFactory: strategiesFactory,
          deps      : [TRI_AUTH_OPTIONS, Injector]
        },
        {provide: TRI_AUTH_TOKENS, useFactory: tokensFactory, deps: [TRI_AUTH_STRATEGIES]},
        {provide: TRI_AUTH_FALLBACK_TOKEN, useValue: TriAuthSimpleToken},
        {provide: TRI_AUTH_INTERCEPTOR_HEADER, useValue: 'Authorization'},
        {provide: TRI_AUTH_TOKEN_INTERCEPTOR_FILTER, useValue: noOpInterceptorFilter},
        {provide: TriTokenStorage, useClass: TriTokenLocalStorage},
        TriAuthTokenParceler,
        TriAuthService,
        TriTokenService,
        TriDummyAuthStrategy,
        TriPasswordAuthStrategy,
        TriOAuth2AuthStrategy,
      ],
    };
  }
}
