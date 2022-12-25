/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriIconModule } from '@gradii/triangle/icon';
import { TriSelectModule } from '@gradii/triangle/select';
import { PaginationComponent } from './pagination.component';

/**
 *
 * # Pagination 分页
 * 采用分页的形式分隔长列表，每次只加载一个页面。
 * ### 何时使用
 * - 当加载/渲染所有数据将花费很多时间时；
 * - 可切换页码浏览数据。
 * ### 代码演示
 * 基础分页。
 * <!-- example(pagination:pagination-basic-example) -->
 * 改变每页显示条目。
 * <!-- example(pagination:pagination-changer-example) -->
 * 迷你版本。
 * <!-- example(pagination:pagination-mini-example) -->
 * 更多分页。
 * <!-- example(pagination:pagination-more-example) -->
 * 快速跳转到某一页。
 * <!-- example(pagination:pagination-jump-example) -->
 * 简单地翻页。
 * <!-- example(pagination:pagination-simple-example) -->
 * 通过设置  `nzShowTotal`  展示总共有多少数据。
 * <!-- example(pagination:pagination-total-example) -->
 */
@NgModule({
  declarations: [PaginationComponent],
  exports     : [PaginationComponent],
  imports     : [CommonModule, FormsModule, TriSelectModule, TriI18nModule, TriIconModule]
})
export class TriPaginationModule {
  static exports() {
    return [PaginationComponent];
  }
}
