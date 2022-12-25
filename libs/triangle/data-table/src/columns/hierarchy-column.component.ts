/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  ContentChild,
  forwardRef,
  Host,
  Input,
  Optional,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { CellTemplateDirective } from '../directive/cell-template.directive';
import { ColumnBase } from './column-base';
import { ColumnComponent } from './column.component';


@Component({
  providers: [
    {
      provide: ColumnBase,
      useExisting: forwardRef(() => HierarchyColumnComponent),
      multi: true
    }
  ],
  selector : 'tri-data-table-hierarchy-column',
  template : ''
})
export class HierarchyColumnComponent extends ColumnComponent {

  isHierarchyColumn = true;


  @Input()
  spanLevel = 12;

  @Input('class') cssClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  } = 'tri-data-table-hierarchy-column';

  @ContentChild(CellTemplateDirective, {static: false}) template;

  constructor(@SkipSelf()
              @Host()
              @Optional()
              public parent: ColumnBase) {
    super(parent);
  }

  get templateRef(): TemplateRef<CellTemplateDirective> {
    return this.template ? this.template.templateRef : undefined;
  }
}
