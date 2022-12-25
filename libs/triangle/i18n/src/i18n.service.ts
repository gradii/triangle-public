/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DatePipe } from '@angular/common';
import { Inject, Injectable, Optional, Provider, SkipSelf } from '@angular/core';
import { LoggerService } from '@gradii/triangle/util';

import { BehaviorSubject, Observable } from 'rxjs';

import zh_CN from '../languages/zh_CN';
import { en_US } from '../public-api';
import { I18nInterface } from './i18n.interface';
import { I18N } from './i18n.token';

@Injectable()
export class I18nService {
  private _locale: I18nInterface = en_US;
  private _change: BehaviorSubject<I18nInterface> = new BehaviorSubject<I18nInterface>(en_US);

  constructor(@Inject(I18N) locale: I18nInterface,
              private _logger: LoggerService,
              private datePipe: DatePipe) {
  }

  get localeChange(): Observable<I18nInterface> {
    return this._change.asObservable();
  }

  translate(path: string, data?: any): string {
    // this._logger.debug(`[NzI18nService] Translating(${this._locale.locale}): ${path}`);
    let content = this._getObjectPath(this._locale, path) as string;
    if (typeof content === 'string') {
      if (data) {
        Object.keys(data).forEach((key) => content = content.replace(new RegExp(`%${key}%`, 'g'), data[key]));
      }
      return content;
    }
    return path;
  }

  /**
   * Set/Change current locale globally throughout the WHOLE application
   * [NOTE] If called at runtime, rendered interface may not change along with the locale change (because this do not trigger another render schedule)
   * @param locale The translating letters
   */
  setLocale(locale: I18nInterface): void {
    if (this._locale && this._locale.locale === locale.locale) {
      return;
    }
    this._locale = locale;
    this._change.next(locale);
  }

  getLocale(): I18nInterface {
    return this._locale;
  }

  getLocaleId(): string {
    return this._locale ? this._locale.locale : '';
  }

  /**
   * Get locale data
   * @param path dot paths for finding exist value from locale data, eg. "a.b.c"
   * @param defaultValue default value if the result is not "truthy"
   */
  getLocaleData(path?: string, defaultValue?: any): any { // tslint:disable-line:no-any
    const result = path ? this._getObjectPath(this._locale, path) : this._locale;
    return result || defaultValue;
  }

  formatDate(date: Date, format?: string, locale?: string): string {
    return date ? this.datePipe.transform(date, format, undefined, locale || this.getLocale().locale) : '';
  }

  /**
   * Format date with compatible for the format of moment and others
   * Why? For now, we need to support the existing language formats in AntD, and AntD uses the default temporal syntax.
   */
  formatDateCompatible(date: Date, format?: string, locale?: string): string {
    return this.formatDate(date, this._compatDateFormat(format), locale);
  }

  parseDate(text: string): Date | null {
    if (!text) {
      return null;
    }
    return new Date(text);
  }

  parseTime(text: string): Date | null {
    if (!text) {
      return null;
    }
    return new Date(`1970-01-01 ${text}`);
  }

  private _getObjectPath(obj: object, path: string): string | object | any { // tslint:disable-line:no-any
    let res: any = obj;
    const paths = path.split('.');
    const depth = paths.length;
    let index = 0;
    while (res && index < depth) {
      res = res[paths[index++]];
    }
    return index === depth ? res : null;
  }

  /**
   * Compatible translate the moment-like format pattern to angular's pattern
   * Why? For now, we need to support the existing language formats in AntD, and AntD uses the default temporal syntax.
   *
   * Each format docs as below:
   * @link https://momentjs.com/docs/#/displaying/format/
   * @link https://angular.io/api/common/DatePipe#description
   * @param format input format pattern
   */
  private _compatDateFormat(format: string): string {
    return format && format
      .replace(/Y/g, 'y') // only support y, yy, yyy, yyyy
      .replace(/D/g, 'd'); // d, dd represent of D, DD for momentjs, others are not support
  }
}

export function LOCALE_SERVICE_PROVIDER_FACTORY(exist: I18nService, locale: I18nInterface, logger: LoggerService, datePipe: DatePipe): I18nService {
  return exist || new I18nService(locale, logger, datePipe);
}

export const I18N_SERVICE_PROVIDER: Provider = {
  provide: I18nService,
  useFactory: LOCALE_SERVICE_PROVIDER_FACTORY,
  deps: [
    [new Optional(), new SkipSelf(), I18nService],
    I18N,
    LoggerService,
    DatePipe
  ]
};
