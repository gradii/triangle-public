/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimelineItemComponent } from './timeline-item.component';
import { TimelineComponent } from './timeline.component';


/**
 *
 * # Timeline时间轴
 * 垂直展示的时间流信息。
 * ### 何时使用
 *
 * 当有一系列信息需要从上至下按时间排列时；
 * 需要有一条时间轴进行视觉上的串联时；
 *
 * ### 代码演示
 *
 * Timeline基础用法。
 * <!-- example(timeline:timeline-basic-example) -->
 * 圆圈颜色，绿色用于已完成、成功状态，红色表示告警或错误状态，蓝色可表示正在进行或其他默认状态。
 * <!-- deprecated-example(timeline:timeline:timeline-color) -->
 *
 * <!-- deprecated-example(timeline:timeline:timeline-pending) -->
 * 可以通过 ` ng-template ` 和 ` #custom ` 设置自定义元素。
 * <!-- deprecated-example(timeline:timeline:timeline-custom) -->
 */
@NgModule({
  declarations: [TimelineItemComponent, TimelineComponent],
  exports     : [TimelineItemComponent, TimelineComponent],
  imports     : [CommonModule]
})
export class TriTimelineModule {
}
