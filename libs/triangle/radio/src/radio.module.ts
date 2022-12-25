/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonComponent } from './radio-button.component';
import { RadioGroupComponent } from './radio-group.component';
import { RadioGroupDirective } from './radio-group.directive';
import { RadioTileDirective } from './radio-tile.directive';
import { RadioComponent } from './radio.component';

/**
 *
 * # Radio 单选框
 * 单选框。
 * ### 何时使用
 *
 * 用于在多个备选项中选中单个状态。
 * 和 Select 的区别是，Radio 所有选项默认可见，方便用户在比较中选择，因此选项不宜过多。
 *
 * ### 代码演示
 *
 * 一组互斥的 Radio 配合使用。
 * <!-- example(radio:radio-group-example) -->
 * 按钮样式的单选组合。
 * <!-- example(radio:radio-button-group-example) -->
 * Radio不可用
 * <!-- example(radio:radio-group-disabled-example) -->
 * 大中小三种组合，可以和表单输入框进行对应配合。
 * <!-- example(radio:radio-button-group-size-example) -->
 */
@NgModule({
  imports     : [CommonModule, FormsModule],
  exports     : [RadioTileDirective, RadioGroupDirective, RadioComponent, RadioButtonComponent, RadioGroupComponent],
  declarations: [RadioTileDirective, RadioGroupDirective, RadioComponent, RadioButtonComponent, RadioGroupComponent]
})
export class TriRadioModule {
}
