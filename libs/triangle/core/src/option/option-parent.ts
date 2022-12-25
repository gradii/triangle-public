/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import {InjectionToken} from '@angular/core';

/**
 * Describes a parent component that manages a list of options.
 * Contains properties that the options can inherit.
 * @docs-private
 */
export interface TriOptionParentComponent {
  disableRipple?: boolean;
  multiple?: boolean;
  inertGroups?: boolean;
}

/**
 * Injection token used to provide the parent component to options.
 */
export const TRI_OPTION_PARENT_COMPONENT = new InjectionToken<TriOptionParentComponent>(
  'TRI_OPTION_PARENT_COMPONENT',
);
