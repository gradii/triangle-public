/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({name: 'triDate'})
export class DatePipe implements PipeTransform {
  transform(value: Date, formatString: string): string {
    if (value) {
      return format(value, formatString);
    } else {
      return '';
    }
  }
}

