/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, Optional,
  ViewEncapsulation
} from '@angular/core';
import { TRI_OPTGROUP, TriOptgroup } from './optgroup';
import { _TriOptionBase } from './option-base';
import { TRI_OPTION_PARENT_COMPONENT, TriOptionParentComponent } from './option-parent';

/**
 * Single option inside of a `<tri-select>` element.
 */
@Component({
  selector       : 'tri-option',
  exportAs       : 'triOption',
  host           : {
    'role'                       : 'option',
    '[attr.tabindex]'            : '_getTabIndex()',
    '[class.tri-selected]'       : 'selected',
    '[class.tri-option-multiple]': 'multiple',
    '[class.tri-active]'         : 'active',
    '[id]'                       : 'id',
    '[attr.aria-selected]'       : '_getAriaSelected()',
    '[attr.aria-disabled]'       : 'disabled.toString()',
    '[class.tri-option-disabled]': 'disabled',
    '(click)'                    : '_selectViaInteraction()',
    '(keydown)'                  : '_handleKeydown($event)',
    'class'                      : 'tri-option tri-focus-indicator',
  },
  styleUrls      : ['option.scss'],
  templateUrl    : 'option.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriOption extends _TriOptionBase {
  constructor(
    element: ElementRef<HTMLElement>,
    changeDetectorRef: ChangeDetectorRef,
    @Optional() @Inject(TRI_OPTION_PARENT_COMPONENT) parent: TriOptionParentComponent,
    @Optional() @Inject(TRI_OPTGROUP) group: TriOptgroup,
  ) {
    super(element, changeDetectorRef, parent, group);
  }
}
