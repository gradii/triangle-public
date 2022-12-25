/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriButtonModule } from '@gradii/triangle/button';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriPopoverModule } from '@gradii/triangle/popover';
import { TRI_CONFIRM_POPUP_SCROLL_STRATEGY_FACTORY_PROVIDER } from './confirm-popup-common';
import { ConfirmPopupComponent } from './confirm-popup.component';
import { ConfirmPopupDirective } from './confirm-popup.directive';


/**
 *
 * # ConfirmPopup 气泡确认框
 * 点击元素，弹出气泡式的确认框。
 * ### 何时使用
 *
 * 目标元素的操作需要用户进一步的确认时，在目标元素附近弹出浮层提示，询问用户。
 * 和 confirm 弹出的全屏居中模态对话框相比，交互形式更轻量。
 *
 * ### 代码演示
 *
 * 最简单的用法。
 * <!-- example(confirm-popup:confirm-popup-basic-example) -->
 * 设置 `okText` `cancelText` 以自定义按钮文字。
 * <!-- deprecated-example(confirm-popup:confirm-popup:confirm-popup-local) -->
 * 位置有十二个方向
 * <!-- example(confirm-popup:confirm-popup-location-example) -->
 * 可以判断是否需要弹出。
 * <!-- example(confirm-popup:confirm-popup-kick-example) -->
 *
 * <!-- example(confirm-popup:confirm-popup-locale-example) -->
 * <!-- example(confirm-popup:confirm-popup-auto-hide-example) -->
 *
 */
@NgModule({
  imports     : [
    CommonModule,
    TriButtonModule,
    OverlayModule,
    TriI18nModule,
    TriCommonModule,
    TriPopoverModule
  ],
  declarations: [
    ConfirmPopupComponent,
    ConfirmPopupDirective
  ],
  exports     : [
    ConfirmPopupComponent,
    ConfirmPopupDirective,
    TriCommonModule,
    CdkScrollableModule
  ],
  providers   : [TRI_CONFIRM_POPUP_SCROLL_STRATEGY_FACTORY_PROVIDER]
})
export class TriConfirmPopupModule {
}
