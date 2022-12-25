/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export class Toolkit {
  static USE_NUM: boolean = true;
  static NUM_UID          = 0;

  /**
   * Generats a unique ID (thanks Stack overflow :3)
   * @returns
   */
  static UID(): string {
    if (Toolkit.USE_NUM) {
      Toolkit.NUM_UID++;
      return `${Toolkit.NUM_UID}`;
    }
    return 'xxxxxxxxxxxxyxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Finds the closest element as a polyfill
   */
  static closest(element: Element, selector: string) {
    return element.closest(selector);
  }
}
