/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, Inject, Input, Optional } from '@angular/core';

// Boilerplate for applying mixins to MatOptgroup.
import { CanDisable, mixinDisabled } from '../common-behaviors';
import { TRI_OPTION_PARENT_COMPONENT, TriOptionParentComponent } from './option-parent';

/** @docs-private */
const _TriOptgroupMixinBase = mixinDisabled(class {
});

// Counter for unique group ids.
let _uniqueOptgroupIdCounter = 0;

@Directive()
export class _TriOptgroupBase extends _TriOptgroupMixinBase implements CanDisable {
  /** Label for the option group. */
  @Input() label: string;

  /** Unique id for the underlying label. */
  _labelId: string = `mat-optgroup-label-${_uniqueOptgroupIdCounter++}`;

  /** Whether the group is in inert a11y mode. */
  _inert: boolean;

  constructor(@Inject(TRI_OPTION_PARENT_COMPONENT) @Optional() parent?: TriOptionParentComponent) {
    super();
    this._inert = parent?.inertGroups ?? false;
  }
}