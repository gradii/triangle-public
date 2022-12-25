/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';
// import { TriDropDownModule } from '@gradii/triangle/dropdown';
import { TriInputModule } from '@gradii/triangle/input';
import { TriInputNumberModule } from '@gradii/triangle/input-number';
import { TriSelectModule } from '@gradii/triangle/select';
import { FilterSharedModule } from '../filtering/shared/filter-shared.module';
import { FilterHostDirective } from './filter-host.directive';
import { AutoCompleteFilterCellComponent } from './filter-row/autocomplete-filter-cell.component';
import { BooleanFilterCellComponent } from './filter-row/boolean-filter-cell.component';
import { DateFilterCellComponent } from './filter-row/date-filter-cell.component';
import { FilterCellOperatorsComponent } from './filter-row/filter-cell-operators.component';
import { FilterCellTemplateDirective } from './filter-row/filter-cell-template.directive';
import { FilterCellWrapperComponent } from './filter-row/filter-cell-wrapper.component';
import { FilterCellComponent } from './filter-row/filter-cell.component';
import { FilterRowComponent } from './filter-row/filter-row.component';
import { NumericFilterCellComponent } from './filter-row/numeric-filter-cell.component';
import { StringFilterCellComponent } from './filter-row/string-filter-cell.component';

const FILTER_OPERATORS: any[] = [
  FilterCellOperatorsComponent,
];
const INTERNAL_COMPONENTS = [
  FilterRowComponent,
  FilterCellComponent,
  FilterCellTemplateDirective,
  FilterCellOperatorsComponent,
  StringFilterCellComponent,
  NumericFilterCellComponent,
  AutoCompleteFilterCellComponent,
  BooleanFilterCellComponent,
  FilterHostDirective,
  FilterCellWrapperComponent,
  // FilterInputDirective,
  DateFilterCellComponent
];
const importedModules = [
  CommonModule,
  ReactiveFormsModule,
  FormsModule,
  TriSelectModule,
  // TriDropDownModule,
  // AutoCompleteModule,
  TriInputModule,
  TriInputNumberModule,
  TriDatePickerModule
];
const ENTRY_COMPONENTS = [
  StringFilterCellComponent,
  NumericFilterCellComponent,
  BooleanFilterCellComponent,
  DateFilterCellComponent
];

@NgModule({
  declarations: [INTERNAL_COMPONENTS, FILTER_OPERATORS],
  imports     : [importedModules, FilterSharedModule],
  exports     : [INTERNAL_COMPONENTS, FILTER_OPERATORS],
})
export class RowFilterModule {
  static exports() {
    return [
      FilterRowComponent,
      FilterCellComponent,
      FilterCellTemplateDirective,
      FilterCellOperatorsComponent,
      StringFilterCellComponent,
      NumericFilterCellComponent,
      AutoCompleteFilterCellComponent,
      BooleanFilterCellComponent,
      DateFilterCellComponent,
      ...FILTER_OPERATORS
    ];
  }
}
