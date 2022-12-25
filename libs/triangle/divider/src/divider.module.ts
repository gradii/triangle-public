import { DividerTipDirective } from './divider-tip.directive';
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

import { BidiModule } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DividerComponent } from './divider.component';


/**
 * <!-- example(divider:divider-basic-example) -->
 */
@NgModule({
  imports     : [BidiModule, CommonModule],
  declarations: [DividerComponent, DividerTipDirective],
  exports     : [DividerComponent, DividerTipDirective]
})
export class TriDividerModule {
}
