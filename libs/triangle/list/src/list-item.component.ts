/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

import { ListItemMetaComponent } from './list-item-meta.component';

@Component({
  selector       : 'tri-list-item',
  templateUrl    : './list-item.component.html',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host           : {
    'class': 'tri-list-item'
  }
})
export class ListItemComponent {
  @ContentChildren(ListItemMetaComponent) metas!: QueryList<ListItemMetaComponent>;
  @Input() actions: Array<TemplateRef<void>> = [];
  @Input() extra: TemplateRef<void>;
}
