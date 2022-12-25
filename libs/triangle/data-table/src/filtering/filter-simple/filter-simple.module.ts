/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TriButtonModule } from '@gradii/triangle/button';
import { TriCardModule } from '@gradii/triangle/card';
import { TriDatePickerModule } from '@gradii/triangle/date-picker';
import { TriGridModule } from '@gradii/triangle/grid';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriInputModule } from '@gradii/triangle/input';
import { TriInputNumberModule } from '@gradii/triangle/input-number';
import { TriSelectModule } from '@gradii/triangle/select';
import { FilterSharedModule } from '../shared/filter-shared.module';
import { FilterSimpleContainerComponent } from './filter-simple-container.component';
import { FilterSimpleHostDirective } from './filter-simple-host.directive';
import { FilterSimpleTemplateDirective } from './filter-simple-template.directive';
import { FilterSimpleComponent } from './filter-simple.component';
import { BooleanFilterSimpleComponent } from './type-filter-simple/boolean-filter-simple.component';
import { DateFilterSimpleComponent } from './type-filter-simple/date-filter-simple.component';
import { NumericFilterSimpleInputComponent } from './type-filter-simple/numeric-filter-simple-input.component';
import { NumericFilterSimpleComponent } from './type-filter-simple/numeric-filter-simple.component';
import { StringFilterSimpleComponent } from './type-filter-simple/string-filter-simple.component';

@NgModule({

  imports     : [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    FilterSharedModule,

    TriGridModule,
    TriButtonModule,
    TriCardModule,
    TriSelectModule,
    TriInputModule,
    TriInputNumberModule,
    TriDatePickerModule,
    TriI18nModule,
    OverlayModule
  ],
  declarations: [
    FilterSimpleComponent,
    FilterSimpleTemplateDirective,
    FilterSimpleContainerComponent,
    FilterSimpleHostDirective,
    BooleanFilterSimpleComponent,
    DateFilterSimpleComponent,
    StringFilterSimpleComponent,
    NumericFilterSimpleComponent,
    NumericFilterSimpleInputComponent,
  ],
  exports     : [
    FilterSimpleComponent,
    BooleanFilterSimpleComponent,
    DateFilterSimpleComponent,
    StringFilterSimpleComponent,
    FilterSimpleTemplateDirective
  ]
})
export class FilterSimpleModule {
  constructor() {
  }

  static exports() {
    return [
      FilterSimpleComponent,
      BooleanFilterSimpleComponent,
      DateFilterSimpleComponent,
      StringFilterSimpleComponent,
      FilterSimpleTemplateDirective
    ];
  }
}
