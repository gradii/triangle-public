/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


/** Options for where to set focus to automatically on dialog open */
export type AutoFocusTarget = 'dialog' | 'first-tabbable' | 'first-heading';

/** Result of the toggle promise that indicates the state of the drawer. */
export type TriDrawerToggleResult = 'open' | 'close';

/** Drawer and SideNav display modes. */
export type TriDrawerMode = 'over' | 'push' | 'side';
