/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCROLL_SERVICE_PROVIDER } from '@gradii/triangle/core';

import { BackTopComponent } from './back-top.component';

/**
 *
 * # BackTop 回到顶部
 * 返回页面顶部的操作按钮。
 * ### 何时使用
 *
 * 当页面内容区域比较长时；
 * 当用户需要频繁返回顶部查看相关内容时。
 *
 * ### 代码演示
 *
 * 最简单的用法。
 * <!-- example(back-top:back-top-basic-example) -->
 * 可以自定义回到顶部按钮的样式，限制宽高： `40px * 40px` 。
 * <!-- deprecated-example(back-top:back-top:back-top-custom) -->
 * 设置  `[nzTarget]`  参数，允许对某个容器返回顶部。
 * <!-- deprecated-example(back-top:back-top:back-top-target) -->
 */
@NgModule({
  declarations: [BackTopComponent],
  exports     : [BackTopComponent],
  imports     : [CommonModule],
  providers   : [SCROLL_SERVICE_PROVIDER]
})
export class TriBackTopModule {
}
