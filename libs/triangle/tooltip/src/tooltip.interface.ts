/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

/** Possible positions for a tooltip. */
export type TooltipPosition =
  'top' |
  'topLeft' |
  'topRight' |
  'right' |
  'rightTop' |
  'rightBottom' |
  'bottom' |
  'bottomLeft' |
  'bottomRight' |
  'left' |
  'leftTop' |
  'leftBottom';

/**
 * Options for how the tooltip trigger should handle touch gestures.
 * See `TriTooltip.touchGestures` for more information.
 */
export type TooltipTouchGestures = 'auto' | 'on' | 'off';

/** Possible visibility states of a tooltip. */
export type TooltipVisibility = 'initial' | 'visible' | 'hidden';


/** Default `triTooltip` options that can be overridden. */
export interface TriTooltipDefaultOptions {
  showDelay: number;
  hideDelay: number;
  touchendHideDelay: number;
  touchGestures?: TooltipTouchGestures;
  position?: TooltipPosition;
}
