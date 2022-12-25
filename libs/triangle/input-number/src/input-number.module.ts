/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriIconModule } from '@gradii/triangle/icon';
import { InputNumberComponent } from './input-number.component';


/**
 *
 * # InputNumber字输入框
 * 通过鼠标或键盘，输入范围内的数值。
 * ### 何时使用
 * 当需要获取标准数值时。
 * ### 代码演示
 *
 * 数字输入框
 * <!-- example(input-number:input-number-basic-example) -->
 * 点击按钮切换可用状态。
 * <!-- example(input-number:input-number-disabled-example) -->
 * 三种大小的数字输入框，当 size 分别为  `large`  和  `small`  时，输入框高度为  `32px`  和
 * `22px`  ，默认高度为  `28px`
 * <!-- example(input-number:input-number-size-example) -->
 * 和原生的数字输入框一样，value 的精度由 step 的小数位数决定。
 * <!-- example(input-number:input-number-digit-example) -->
 *
 * <!-- example(input-number:input-number-focused-example) -->
 */
@NgModule({
    imports: [CommonModule, FormsModule, TriIconModule],
  declarations: [InputNumberComponent],
  exports     : [InputNumberComponent]
})
export class TriInputNumberModule {
}
