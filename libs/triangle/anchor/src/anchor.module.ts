/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SCROLL_SERVICE_PROVIDER } from '@gradii/triangle/core';
import { AnchorLinkTemplateDirective } from './anchor-link-template.directive';
import { AnchorLinkComponent } from './anchor-link.component';

import { AnchorComponent } from './anchor.component';


/**
 *
 * # Anchor 锚点
 * 用于跳转到页面指定位置。
 * ### 何时使用
 * 需要展现当前页面上可供跳转的锚点链接，以及快速在锚点之间跳转。
 * ### 代码演示
 * <!-- example(anchor:anchor-basic-example) -->
 * sticky
 * <!-- deprecated-example(anchor:anchor:anchor-fixed) -->
 * 最简单的用法。
 * <!-- deprecated-example(anchor:anchor:anchor-basic) -->
 */
@NgModule({
  declarations: [AnchorComponent, AnchorLinkComponent, AnchorLinkTemplateDirective],
  exports     : [AnchorComponent, AnchorLinkComponent, AnchorLinkTemplateDirective],
  imports     : [CommonModule],
  providers   : [SCROLL_SERVICE_PROVIDER]
})
export class TriAnchorModule {
}
