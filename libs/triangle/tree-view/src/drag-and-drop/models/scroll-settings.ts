/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/**
 * Defines the auto-scrolling behavior during drag-and-drop.
 * When enbaled, the first scrollable container going from the TreeView and up will be scrolled
 * when the dragged item reaches the top of that container or its bottom.
 */
export interface DragAndDropScrollSettings {
  /**
   * Controlls whether scrolling is enabled.
   *
   */
  enabled?: boolean;
  /**
   * Specifies the step (in pixels) by which the scrolling will be performed.
   *
   */
  step?: number;
  /**
   * Specifies the interval (in milliseconds) in which the scrolling will be performed.
   *
   */
  interval?: number;
}

