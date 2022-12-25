/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriTooltipModule } from '@gradii/triangle/tooltip';
import { SliderHandleComponent } from './slider-handle.component';
import { SliderMarksComponent } from './slider-marks.component';
import { SliderStepComponent } from './slider-step.component';
import { SliderTrackComponent } from './slider-track.component';
import { SliderComponent } from './slider.component';
import { SliderService } from './slider.service';

/**
 *
 # Slider滑动输入条
 * 滑动型输入器，展示当前值和可选范围。
 * ### 何时使用
 * 当用户需要在数值区间/自定义区间内进行选择时，可为连续或离散值。
 * ### 代码演示
 * 基本滑动条。当  `range`  为  `true`  时，渲染为双滑块。当  `disabled`  为  `true`  时，滑块处于不可用状态。
 * <!-- example(slider:slider-basic-example) -->
 * 滑块左右可以设置图标来表达业务含义。
 * <!-- deprecated-example(slider:slider:slider-icon) -->
 * 当 Slider 的值发生改变时，会更新  `ngModel`  所绑定的变量(可通过setter方式或绑定ngModelChange来监测此事件)。在  `onmouseup`  时，会触发  `onAfterChange`  事件，并把当前值作为参数传入。
 * <!-- deprecated-example(slider:slider:slider-event) -->
 * 垂直方向的 Slider。
 * <!-- deprecated-example(slider:slider:slider-vertical) -->
 * 和  数字输入框  组件保持同步。
 * <!-- deprecated-example(slider:slider:slider-input-number) -->
 * 使用  `nzTipFormatter`  可以格式化  `Tooltip`  的内容，设置  `[nzTipFormatter]="null"` ，则隐藏  `Tooltip。`
 * <!-- deprecated-example(slider:slider:slider-tip-formatter) -->
 * 使用  `marks`  属性标注分段式滑块，使用  `value`  /  `defaultValue`  指定滑块位置。当  `included=false`  时，表明不同标记间为并列关系。当  `step=null`  时，Slider 的可选值仅有  `marks`  标出来的部分。
 * <!-- deprecated-example(slider:slider:slider-mark) -->
 */
@NgModule({
  exports     : [
    SliderComponent, SliderTrackComponent, SliderHandleComponent, SliderStepComponent,
    SliderMarksComponent
  ],
  declarations: [
    SliderComponent,
    SliderTrackComponent,
    SliderHandleComponent,
    SliderStepComponent,
    SliderMarksComponent
  ],
  imports     : [CommonModule, TriTooltipModule],
  providers   : [SliderService]
})
export class TriSliderModule {
}
