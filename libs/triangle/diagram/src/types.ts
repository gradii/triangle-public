/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentPortal } from '@angular/cdk/portal';
import { Type } from '@angular/core';


export type BaseEntityType =
  | 'node'
  | 'link'
  | 'port'
  | 'point'
  | 'label'
  | 'diagram';

export interface ComponentProviderOptions<T = any> {
  component: Type<T> | ComponentPortal<any>;
  type: BaseEntityType;
  namespace?: string;
}
