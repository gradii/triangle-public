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
import { ColumnBase } from '../columns/column-base';
import { CellTemplateDirective } from '../directive/cell-template.directive';
import { AutoGenerateColumnPositon } from './column-base';

@Component({
  providers: [
    {
      provide: ColumnBase,
      useExisting: forwardRef(() => CheckboxColumnComponent) // tslint:disable-line:no-forward-ref
    }
  ],
  selector : 'tri-data-table-checkbox-column',
  template : ''
})
export class CheckboxColumnComponent extends ColumnBase {
  autoGenerateColumnPosition = 'start' as AutoGenerateColumnPositon;

  isCheckboxColumn = true;

  @Input('class') cssClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  } = 'tri-data-table-checkbox-column';

  @Input() showSelectAll;

  @ContentChild(CellTemplateDirective, {static: false}) template;

  constructor(@SkipSelf()
              @Host()
              @Optional()
                parent: ColumnBase) {
    super(parent);
  }

  get templateRef(): TemplateRef<CellTemplateDirective> {
    return this.template ? this.template.templateRef : undefined;
  }
}
