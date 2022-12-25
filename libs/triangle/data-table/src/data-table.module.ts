/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriPaginationModule } from '@gradii/triangle/pagination';
import { TriSpinModule } from '@gradii/triangle/spin';
import { DataTableComponent } from './data-table.component';
// import { CldrIntlService, IntlService } from '@gradii/triangle/tri-angular-intl';
import { FilterSimpleModule } from './filtering/filter-simple/filter-simple.module';
// import { LocalizedMessagesDirective } from './localization/localized-messages.directive';
// import { CustomMessagesComponent } from './localization/custom-messages.component';
import { RowFilterModule } from './filtering/row-filter.module';
import { GroupModule } from './grouping/group.module';
import { ListComponent } from './list.component';
import { SelectionDirective } from './selection/selection.directive';
import { BodyModule } from './table-body/body.module';
import { FooterModule } from './table-footer/footer.module';
import { HeaderModule } from './table-header/header.module';
import { SharedModule } from './table-shared/shared.module';
import { ToolbarTemplateDirective } from './table-shared/toolbar-template.directive';
import { ToolbarComponent } from './table-toolbar/toolbar.component';

/**
 * <!-- example(data-table:data-table-basic-example) -->
 */
@NgModule({
  declarations: [
    DataTableComponent,
    ListComponent,
    ToolbarComponent,
    // LocalizedMessagesDirective,
    // CustomMessagesComponent,
    ToolbarTemplateDirective,
    SelectionDirective,
  ],
  exports     : [
    DataTableComponent,
    ToolbarTemplateDirective,
    // ToolbarComponent,
    SelectionDirective,
    // CustomMessagesComponent,
    GroupModule,
    SharedModule,
    BodyModule,
    HeaderModule,
    FooterModule,
    TriPaginationModule,
    RowFilterModule,
    FilterSimpleModule
  ],
  imports     : [
    CommonModule,
    GroupModule,
    SharedModule,
    BodyModule,
    HeaderModule,
    FooterModule,
    TriPaginationModule,
    RowFilterModule,
    FilterSimpleModule,
    TriSpinModule,
    LayoutModule
  ],
  providers   : [
    // {provide: IntlService, useClass: CldrIntlService}
  ]
})
export class TriDataTableModule {
}
