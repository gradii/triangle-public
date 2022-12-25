import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriCheckboxModule } from '@gradii/triangle/checkbox';
import { TriDndModule } from '@gradii/triangle/dnd';
import { TriSearchModule } from '@gradii/triangle/search';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { TriTooltipModule } from '@gradii/triangle/tooltip';
import { TransferComponent } from './transfer.component';


/**
 * # Transfer
 *
 * #### Examples
 * <!-- example(transfer:transfer-virtual-scroll-example) -->
 * <!-- example(transfer:transfer-sort-example) -->
 * <!-- example(transfer:transfer-search-example) -->
 * <!-- example(transfer:transfer-custom-example) -->
 * <!-- example(transfer:transfer-basic-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    FormsModule,
    ScrollingModule,
    TriSearchModule,
    TriCheckboxModule,
    TriTooltipModule,
    TriDndModule,
    TriI18nModule,
  ],
  exports     : [TransferComponent],
  declarations: [TransferComponent],
  providers   : []
})
export class TriTransferModule {
}
