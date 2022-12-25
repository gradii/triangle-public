import { HttpRequest } from '@angular/common/http';
import { Injector } from '@angular/core';
import { defaultAuthOptions, TriAuthOptions, TriAuthStrategyClass } from './auth.options';
import { deepExtend } from './helpers';
import { TriAuthTokenClass } from './services/token/token';
import { TriAuthStrategy } from './strategies/auth-strategy';
import { TriAuthStrategyOptions } from './strategies/auth-strategy-options';


export function strategiesFactory(options: TriAuthOptions,
                                  injector: Injector): TriAuthStrategy[] {
  const strategies: TriAuthStrategy[] = [];
  options.strategies
    .forEach(([strategyClass, strategyOptions]: [TriAuthStrategyClass, TriAuthStrategyOptions]) => {
      const strategy: TriAuthStrategy = injector.get(strategyClass);
      strategy.setOptions(strategyOptions);

      strategies.push(strategy);
    });
  return strategies;
}

export function tokensFactory(strategies: TriAuthStrategy[]): TriAuthTokenClass[] {
  const tokens: TriAuthTokenClass[] = [];
  strategies
    .forEach((strategy: TriAuthStrategy) => {
      tokens.push(strategy.getOption('token.class'));
    });
  return tokens;
}

export function optionsFactory(options: any) {
  return deepExtend(defaultAuthOptions, options);
}

export function noOpInterceptorFilter(req: HttpRequest<any>): boolean {
  return true;
}