/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { SortDescriptor } from '@gradii/triangle/data-query';
import { Subject } from 'rxjs';

/**
 * @hidden
 */
export class SortService {

  changes: Subject<SortDescriptor[]> = new Subject<SortDescriptor[]>();

  sort(value: SortDescriptor[]): void {
    this.changes.next(value);
  }
}
