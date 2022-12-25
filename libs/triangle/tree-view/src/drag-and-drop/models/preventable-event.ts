/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/**
 * @hidden
 */
export class PreventableEvent {
  prevented: any;

  constructor() {
    this.prevented = false;
  }

  /**
   * Prevents the default action for a specified event.
   * In this way, the source component suppresses the built-in behavior that follows the event.
   */
  preventDefault() {
    this.prevented = true;
  }

  /**
   * If the event is prevented by any of its subscribers, returns `true`.
   *
   * @returns `true` if the default action was prevented. Otherwise, returns `false`.
   */
  isDefaultPrevented() {
    return this.prevented;
  }
}
