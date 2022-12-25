/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  ContentChild,
  Host,
  Input,
  Optional,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { CellTemplateDirective } from '../directive/cell-template.directive';
import { AutoGenerateColumnPositon, ColumnBase } from './column-base';

@Component({
  providers: [
    {
      provide: ColumnBase,
      useExisting: CommandColumnComponent
    }
  ],
  selector : 'tri-data-table-command-column',
  template : ''
})
export class CommandColumnComponent extends ColumnBase {
  autoGenerateColumnPosition = 'end' as AutoGenerateColumnPositon;

  @Input() cssClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  } = 'tri-data-table-command-column';

  parent: ColumnBase;
  @ContentChild(CellTemplateDirective, {static: false}) template: CellTemplateDirective;

  constructor(@SkipSelf()
              @Host()
              @Optional()
                parent?: ColumnBase) {
    super(parent);
  }

  get templateRef(): TemplateRef<any> {
    return this.template ? this.template.templateRef : undefined;
  }
}
