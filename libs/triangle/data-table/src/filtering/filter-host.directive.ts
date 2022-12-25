/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChange,
  Type,
  ViewContainerRef
} from '@angular/core';
import { CompositeFilterDescriptor } from '@gradii/triangle/data-query';
import { isNullOrEmptyString } from '@gradii/triangle/util';
import { ColumnComponent } from '../columns/column.component';
import { anyChanged } from '../utils';
import { FilterComponent } from './filter-component.interface';
import { filterComponentFactory } from './filter-row/filter-cell-component.factory';
import { StringFilterCellComponent } from './filter-row/string-filter-cell.component';

export type Context = {
  filter: CompositeFilterDescriptor;
  column: ColumnComponent;
};

@Directive({
  selector: '[triFilterHost]'
})
export class FilterHostDirective implements OnInit, OnDestroy, OnChanges {
  @Input() column: ColumnComponent;
  @Input() filter: CompositeFilterDescriptor;
  protected component: ComponentRef<FilterComponent>;
  private host;
  private resolver;

  constructor(host: ViewContainerRef, resolver: ComponentFactoryResolver) {
    this.host = host;
    this.resolver = resolver;
  }

  ngOnInit() {
    this.component = this.host.createComponent(this.resolver.resolveComponentFactory(this.componentType()));
    this.initComponent({
      column: this.column,
      filter: this.filter
    });
  }

  ngOnDestroy() {
    if (this.component) {
      this.component.destroy();
      this.component = null;
    }
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }): void {
    if (anyChanged(['column', 'filter'], changes)) {
      this.initComponent({
        column: this.column,
        filter: this.filter
      });
    }
  }

  protected componentType(): Type<any> {
    if (!isNullOrEmptyString(this.column.filter)) {
      return filterComponentFactory(this.column.filter);
    }
    return StringFilterCellComponent;
  }

  protected initComponent(ctx: Context) {
    const {column, filter} = ctx;
    const instance = this.component.instance;
    instance.column = column;
    instance.filter = filter;
  }
}
