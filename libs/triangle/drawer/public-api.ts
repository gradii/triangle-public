/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export * from './src/drawer.module';
export { TriDrawer } from './src/drawer';
export {
  throwDuplicatedDrawerError,
  TRI_DRAWER_DEFAULT_AUTOSIZE,
  TRI_DRAWER_DEFAULT_AUTOSIZE_FACTORY,
  TRI_DRAWER_CONTAINER,
} from './src/common';
export { TriDrawerContent } from './src/drawer-content';
export { TriDrawerContainer } from './src/drawer-container';
export { TriDrawerMode, TriDrawerToggleResult } from './src/drawer.types';
export * from './src/drawer-animations';
