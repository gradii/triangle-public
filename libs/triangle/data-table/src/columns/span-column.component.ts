/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  ContentChildren,
  Host,
  Input,
  Optional,
  QueryList,
  SkipSelf,
  TemplateRef
} from '@angular/core';
import { isPresent } from '@gradii/triangle/util';
import { CellTemplateDirective } from '../directive/cell-template.directive';
import { EditTemplateDirective } from '../directive/edit-template.directive';
import { ColumnBase } from './column-base';
import { ColumnComponent } from './column.component';

export function isSpanColumnComponent(column): column is SpanColumnComponent {
  return column.isSpanColumn;
}

@Component({
  providers: [
    {
      provide: ColumnBase,
      useExisting: SpanColumnComponent
    }
  ],
  selector : 'tri-data-table-span-column',
  template : ''
})
export class SpanColumnComponent extends ColumnBase {
  readonly isSpanColumn: boolean;
  @ContentChildren(CellTemplateDirective, {descendants: false})
  template: QueryList<CellTemplateDirective>;
  @ContentChildren(EditTemplateDirective, {descendants: false})
  editTemplate: QueryList<EditTemplateDirective>;
  @ContentChildren(ColumnComponent) childColumns: QueryList<ColumnComponent>;
  title: string;
  // width: number;
  headerStyle: {
    [key: string]: string;
  };
  footerStyle: {
    [key: string]: string;
  };
  headerClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  };
  footerClass: | string
    | string[]
    | Set<string>
    | {
    [key: string]: any;
  };

  constructor(@SkipSelf()
              @Host()
              @Optional()
              public parent: ColumnBase) {
    super(parent);

    this.isSpanColumn = true;
    this.template = new QueryList<CellTemplateDirective>();
    this.editTemplate = new QueryList<EditTemplateDirective>();
    this.childColumns = new QueryList<ColumnComponent>();
    this._editable = true;
    this._hidden = false;
    this._locked = false;
    if (parent && (<SpanColumnComponent>parent).isSpanColumn) {
      throw new Error('SpanColumn cannot be nested inside another SpanColumn');
    }
  }

  private _editable;

  get editable() {
    return isPresent(this.editTemplateRef) && this._editable;
  }

  set editable(value) {
    this._editable = value;
  }

  private _hidden;


  @Input()
  // @ts-ignore
  get hidden(): boolean {
    return this._hidden || this.childColumns.toArray().every(x => x.hidden);
  }

  set hidden(value) {
    this._hidden = value;
  }

  private _locked;
  // @ts-ignore
  get locked() {
    return this._locked || this.childColumns.some(c => c.locked);
  }

  set locked(value) {
    this._locked = value;
  }

  get templateRef() {
    const template = this.template.first;
    return template ? template.templateRef : undefined;
  }

  get editTemplateRef(): TemplateRef<any> {
    const editTemplate = this.editTemplate.first;
    return editTemplate ? editTemplate.templateRef : undefined;
  }

  get colspan() {
    return this.childColumns.filter(c => !c.hidden).length;
  }
}
