/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { SizeLDSType } from '@gradii/triangle/core';

import { ListGrid } from './interface';

@Component({
  selector       : 'tri-list',
  templateUrl    : './list.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host           : {
    '[class.tri-list]'                          : 'true',
    '[class.tri-list-vertical]'                 : 'itemLayout === "vertical"',
    '[class.tri-list-lg]'                       : 'size === "large"',
    '[class.tri-list-sm]'                       : 'size === "small"',
    '[class.tri-list-split]'                    : 'split',
    '[class.tri-list-bordered]'                 : 'bordered',
    '[class.tri-list-loading]'                  : 'loading',
    '[class.tri-list-grid]'                     : 'grid',
    '[class.tri-list-something-after-last-item]': '!!(loadMore || pagination || footer)'
  },
  styleUrls      : ['../style/list.scss'],
  styles         : [
    `
      tri-list,
      tri-list tri-spin {
        display : block;
      }
    `
  ],
})
export class ListComponent {
  // #region fields
  // tslint:disable-next-line:no-any
  @Input() dataSource: any[];

  @Input() bordered = false;

  @Input() grid: ListGrid;

  @Input() header: string | TemplateRef<void>;

  @Input() footer: string | TemplateRef<void>;

  @Input() itemLayout: 'vertical' | 'horizontal' = 'horizontal';

  @Input() renderItem: TemplateRef<void>;

  @Input() loading = false;

  @Input() loadMore: TemplateRef<void>;

  @Input() pagination: TemplateRef<void>;

  @Input() size: SizeLDSType = 'default';

  @Input() split = true;

  @Input() noResult: string | TemplateRef<void>;

  // #endregion
  constructor(private el: ElementRef) {
  }

}
