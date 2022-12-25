/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { RateComponent, _RateStarItemComponent } from './rate.component';

/**
 *
 * # Rate 评分
 * 评分组件。
 * ### 何时使用
 * 对评价进行展示。
 * 对事物进行快速的评级操作。
 * ### 代码演示
 * 最简单的用法。
 * <!-- example(rate:rate-basic-example) -->
 * 给评分组件加上文案展示。
 * <!-- example(rate:rate-text-example) -->
 * 支持选中半星。
 * <!-- example(rate:rate-half-example) -->
 * 只读，无法进行鼠标交互。
 * <!-- example(rate:rate-disabled-example) -->
 *
 * <!-- example(rate:rate-control-example) -->
 */
@NgModule({
  imports     : [CommonModule, TriIconModule],
  declarations: [RateComponent, _RateStarItemComponent],
  exports     : [RateComponent],
})
export class TriRateModule {
}
