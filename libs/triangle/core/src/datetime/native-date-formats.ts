/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import {TriDateFormats} from './date-formats';


export const TRI_NATIVE_DATE_FORMATS: TriDateFormats = {
  parse: {
    dateInput: null,
  },
  display: {
    dateInput: {year: 'numeric', month: 'numeric', day: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},
  }
};
