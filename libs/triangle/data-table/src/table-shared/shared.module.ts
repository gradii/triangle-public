/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ColGroupComponent } from '../col-group.component';
import { TableDirective } from '../column-resize/table.directive';
import { ColumnGroupComponent } from '../columns/column-group.component';
import { ColumnComponent } from '../columns/column.component';
import { SpanColumnComponent } from '../columns/span-column.component';
import { FieldAccessorPipe } from '../pipe/field-accessor.pipe';
import { FooterTemplateDirective } from '../table-footer/footer-template.directive';
import { DetailTemplateDirective } from './detail-template.directive';
import { DraggableDirective } from './draggable.directive';
import { ResizableContainerDirective } from './resizable.directive';

@NgModule({
  declarations: [
    DraggableDirective,
    ColumnComponent,
    ColumnGroupComponent,
    FooterTemplateDirective,
    ColGroupComponent,
    ResizableContainerDirective,
    FieldAccessorPipe,
    DetailTemplateDirective,
    SpanColumnComponent,
    TableDirective,
  ],
  exports     : [
    DraggableDirective,
    ColumnComponent,
    ColumnGroupComponent,
    FooterTemplateDirective,
    ColGroupComponent,
    ResizableContainerDirective,
    FieldAccessorPipe,
    DetailTemplateDirective,
    SpanColumnComponent,
    TableDirective
  ],
  imports     : [CommonModule]
})
export class SharedModule {
  static exports() {
    return [
      ColumnComponent,
      SpanColumnComponent,
      ColumnGroupComponent,
      FooterTemplateDirective,
      DetailTemplateDirective
    ];
  }
}
