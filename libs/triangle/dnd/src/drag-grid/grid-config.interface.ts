/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export type gridTypes =
  | 'fit'
  | 'scrollVertical'
  | 'scrollHorizontal'
  | 'fixed'
  | 'verticalFixed'
  | 'horizontalFixed';
export type displayGrids = 'always' | 'onDrag&Resize' | 'none';
export type compactTypes =
  | 'none'
  | 'compactUp'
  | 'compactLeft'
  | 'compactUp&Left'
  | 'compactLeft&Up'
  | 'compactRight'
  | 'compactUp&Right'
  | 'compactRight&Up'
  | 'compactDown'
  | 'compactDown&Left'
  | 'compactLeft&Down'
  | 'compactDown&Right'
  | 'compactRight&Down';

export const enum GridType {
  Fit              = 'fit',
  ScrollVertical   = 'scrollVertical',
  ScrollHorizontal = 'scrollHorizontal',
  Fixed            = 'fixed',
  VerticalFixed    = 'verticalFixed',
  HorizontalFixed  = 'horizontalFixed'
}

export const enum DisplayGrid {
  Always          = 'always',
  OnDragAndResize = 'onDrag&Resize',
  None            = 'none'
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

export const enum DirTypes {
  LTR = 'ltr',
  RTL = 'rtl'
}

export type dirTypes = 'ltr' | 'rtl';