/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class PreventableEvent {
  private prevented;

  constructor() {
    this.prevented = false;
  }

  preventDefault() {
    this.prevented = true;
  }

  isDefaultPrevented() {
    return this.prevented;
  }
}
