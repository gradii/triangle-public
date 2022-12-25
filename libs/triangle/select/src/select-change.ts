/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriSelect } from './select.component';

/** Change event object that is emitted when the select value has changed. */
export class TriSelectChange {
  constructor(
    /** Reference to the select that emitted the change event. */
    public source: TriSelect,
    /** Current value of the select that emitted the event. */
    public value: any,
  ) {
  }
}