/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector     : 'tri-card',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ng-content></ng-content>
  `,
  host         : {
    'class'                       : 'tri-card',
    '[class.tri-card-bordered]'   : 'bordered',
    '[class.tri-card-no-hovering]': 'noHovering'
  },
  styleUrls    : ['../style/card.scss']
})
export class CardComponent {

  constructor() {
  }

  /**
   * Whether show border
   * 是否有边框
   */
  @Input()
  bordered         = true;
  /**
   * Whether show loading
   * 是否显示加载状态
   */
  @Input() loading = false;
  /**
   * Whether show the class of no hover
   * 取消鼠标移过浮起
   */
  @Input()
  noHovering       = true;
}
