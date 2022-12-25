/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriRippleModule } from '@gradii/triangle/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { ButtonGroupComponent } from './button-group.component';
import {
  ButtonComponent
} from './button.component';

/**
 *
 * # Button 按钮
 * 按钮用于开始一个即时操作。
 * ### 何时使用
 * 标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。
 * ### 代码演示
 *
 * 按钮有四种类型：主按钮、次按钮、虚线按钮、危险按钮。主按钮在同一个操作区域最多出现一次。
 * <!-- example(button:button-type-example) -->
 * 按钮有大、中、小三种尺寸。
 * <!-- example(button:button-size-example) -->
 * 添加  `loading`  属性即可让按钮处于加载状态，最后两个按钮演示点击后进入加载状态。
 * <!-- example(button:button-loading-example) -->
 * 可以将多个  `tri-button`  放入  `tri-button-group`  的容器中。
 * <!-- example(button:button-group-example) -->
 * 当需要在  `button`  内嵌入  `icon`  时，请直接在  `button`  内使用 `icon`
 * <!-- example(button:button-icon-example) -->
 * 添加  `disabled`  属性即可让按钮处于不可用状态，同时按钮样式也会改变。
 * <!-- example(button:button-disabled-example) -->
 * 按钮组合使用时，推荐使用1个主操作 + n 个次操作，3个以上操作时把更多操作放到  `tri-dropdown button`  中组合使用。
 * <!-- example(button:button-multiple-example) -->
 * 幽灵按钮将其他按钮的内容反色，背景变为透明，常用在有色背景上。
 * <!-- example(button:button-ghost-example) -->
 *
 * <!-- example(button:button-color-example) -->
 */
@NgModule({
  declarations: [
    ButtonComponent, ButtonGroupComponent
  ],
  exports     : [
    ButtonComponent, ButtonGroupComponent
  ],
  imports     : [CommonModule, TriIconModule, TriRippleModule]
})
export class TriButtonModule {
}
