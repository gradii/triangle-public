/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import { BreadcrumbItemComponent } from './breadcrumb-item.component';

@Component({
  selector       : 'tri-breadcrumb',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ng-content></ng-content>`,
  styleUrls      : ['../style/breadcrumb.scss'],
  host           : {
    'class': 'tri-breadcrumb'
  }
})
export class BreadcrumbComponent implements AfterViewChecked {

  @ContentChildren(BreadcrumbItemComponent, {descendants: false})
  breadCrumbItems: QueryList<BreadcrumbItemComponent>;

  /**
   * Separator
   * 分隔符自定义
   */
  @Input() separator = '/';

  constructor() {
  }

  ngAfterViewChecked() {
    const length = this.breadCrumbItems.length;
    this.breadCrumbItems.forEach((it, index) => {
      const isLast = index === length - 1;
      if (it.isLast != isLast) {
        it.isLast = isLast;
        it._detectChange();
      }
    });
  }
}
