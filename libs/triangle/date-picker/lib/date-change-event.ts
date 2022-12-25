/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// export class DateChangeEvent {
//   constructor(public current: CandyDate, public previous: CandyDate, public source?: DateChangeSource) {}
// }

export type DateChangeSource =
  'date-input' | // Represent the result value output by user's input
  'header-switch' | // Represent the changes by user from header
  'date-select'; // Represent the result value output by user's selecting
