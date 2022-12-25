/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {InjectionToken} from '@angular/core';


export type TriDateFormats = {
  parse: {
    dateInput: any
  },
  display: {
    dateInput: any,
    monthLabel?: any,
    monthYearLabel: any,
    dateA11yLabel: any,
    monthYearA11yLabel: any,
  }
};


export const TRI_DATE_FORMATS = new InjectionToken<TriDateFormats>('tri-date-formats');
