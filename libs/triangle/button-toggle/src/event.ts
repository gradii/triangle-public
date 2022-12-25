/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TriButtonToggle } from './button-toggle';

/** Change event object emitted by TriButtonToggle. */
export class TriButtonToggleChange {
  constructor(
    /** The TriButtonToggle that emits the event. */
    public source: TriButtonToggle,
    /** The value assigned to the TriButtonToggle. */
    public value: any,
  ) {
  }
}
