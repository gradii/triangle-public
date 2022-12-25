/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { InjectionToken } from '@angular/core';
import type { BaseEntityType } from './types';


export const DIAGRAM_STATES = new InjectionToken('diagram states');

export const DIAGRAM_NODE_COMPONENTS = new InjectionToken<Omit<BaseEntityType, 'type'>>
('diagram node components');

export const DIAGRAM_NODE_DATA = new InjectionToken('diagram node data');

export const LINK_COMPONENTS = new InjectionToken('link components');