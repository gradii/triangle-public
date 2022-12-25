/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';

import { I18nInterface } from './i18n.interface';

export const I18N = new InjectionToken<I18nInterface>('tri-i18n');
