/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/** Vertical direction in which we can auto-scroll. */
export const enum AutoScrollVerticalDirection {NONE, UP, DOWN}

/** Horizontal direction in which we can auto-scroll. */
export const enum AutoScrollHorizontalDirection {NONE, LEFT, RIGHT}


/**
 * Proximity, as a ratio to width/height at which to start auto-scrolling the drop list or the
 * viewport. The value comes from trying it out manually until it feels right.
 */
export const SCROLL_PROXIMITY_THRESHOLD = 0.05;


/**
 * Proximity, as a ratio to width/height, at which a
 * dragged item will affect the drop container.
 */
export const DROP_PROXIMITY_THRESHOLD = 0.05;


export enum Direction {
  xy = 'xy',
  yx = 'yx'
}


export const enum CompactType {
  None                = 'none',
  CompactUp           = 'compactUp',
  CompactLeft         = 'compactLeft',
  CompactUpAndLeft    = 'compactUp&Left',
  CompactLeftAndUp    = 'compactLeft&Up',
  CompactRight        = 'compactRight',
  CompactUpAndRight   = 'compactUp&Right',
  CompactRightAndUp   = 'compactRight&Up',
  CompactDown         = 'compactDown',
  CompactDownAndLeft  = 'compactDown&Left',
  CompactLeftAndDown  = 'compactLeft&Down',
  CompactDownAndRight = 'compactDown&Right',
  CompactRightAndDown = 'compactRight&Down'
}

export type GridTypes =
  'fit'
  | 'scrollVertical'
  | 'scrollHorizontal'
  | 'fixed'
  | 'verticalFixed'
  | 'horizontalFixed';
