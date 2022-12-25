/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

export type SizeLDSType = 'large' | 'default' | 'small';
export type SizeMDSType = 'middle' | 'default' | 'small';
export type SizeDSType = 'default' | 'small';

export interface SizeMap {
  [size: string]: string;
}
