/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import {
  ChangeDetectionStrategy, Component, InjectionToken, ViewEncapsulation,
} from '@angular/core';
import { _TriOptgroupBase } from './optgroup-base';


/**
 * Injection token that can be used to reference instances of `MatOptgroup`. It serves as
 * alternative token to the actual `MatOptgroup` class which could cause unnecessary
 * retention of the class and its component metadata.
 */
export const TRI_OPTGROUP = new InjectionToken<TriOptgroup>('TriOptgroup');

/**
 * Component that is used to group instances of `mat-option`.
 */
@Component({
  selector       : 'tri-optgroup',
  exportAs       : 'triOptgroup',
  templateUrl    : 'optgroup.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  inputs         : ['disabled'],
  styleUrls      : ['optgroup.scss'],
  host           : {
    'class'                        : 'tri-optgroup',
    '[attr.role]'                  : '_inert ? null : "group"',
    '[attr.aria-disabled]'         : '_inert ? null : disabled.toString()',
    '[attr.aria-labelledby]'       : '_inert ? null : _labelId',
    '[class.tri-optgroup-disabled]': 'disabled',
  },
  providers      : [{provide: TRI_OPTGROUP, useExisting: TriOptgroup}],
})
export class TriOptgroup extends _TriOptgroupBase {
}
