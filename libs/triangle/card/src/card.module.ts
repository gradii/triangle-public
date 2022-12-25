/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCardBodyComponent } from './card-body.component';
import { TriCardFooterComponent } from './card-footer.component';
import { TriCardHeaderComponent, TriCardHeaderExtraComponent } from './card-header.component';
import { TriCardLoadingComponent } from './card-loading.component';

import { CardComponent } from './card.component';
import {
  TriCardActions, TriCardAvatar, TriCardGrid, TriCardImage, TriCardLgImage, TriCardMdImage,
  TriCardSmImage, TriCardXlImage
} from './card.directive';


const CARD_DIRECTIVES = [
  TriCardActions,
  TriCardImage,
  TriCardSmImage,
  TriCardMdImage,
  TriCardLgImage,
  TriCardXlImage,
  TriCardAvatar,
  TriCardGrid,

  TriCardHeaderComponent,
  TriCardHeaderExtraComponent,
  TriCardBodyComponent,
  TriCardFooterComponent
];


/**
 *
 * # Card 卡片
 * 通用卡片容器。
 * ### 何时使用
 * 最基础的卡片容器，可承载文字、列表、图片、段落，常用于后台概览页面。
 * ### 代码演示
 *
 * 包含标题、内容、操作区域。
 * <!-- example(card:card-basic-example) -->
 * 在灰色背景上使用无边框的卡片。
 * <!-- example(card:card-border-example) -->
 * 只包含内容区域。
 * <!-- example(card:card-simple-example) -->
 * 可以调整默认边距，设定宽度。
 * <!-- example(card:card-flex-example) -->
 * 在系统概览页面常常和栅格进行配合。
 * <!-- example(card:card-grid-example) -->
 * 数据读入前会有文本块样式。
 * <!-- example(card:card-loading-example) -->
 * 一种常见的卡片内容区隔模式。
 * <!-- deprecated-example(card:card-inner) -->
 *
 * <!-- example(card:card-image-example) -->
 * <!-- example(card:card-footer-example) -->
 * <!-- example(card:card-actions-example) -->
 */
@NgModule({
  imports     : [CommonModule],
  declarations: [
    CardComponent,
    TriCardLoadingComponent,

    ...CARD_DIRECTIVES,
  ],
  exports     : [
    CardComponent,

    ...CARD_DIRECTIVES
  ]
})
export class TriCardModule {
}
