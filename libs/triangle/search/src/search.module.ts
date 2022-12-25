import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriIconModule } from '@gradii/triangle/icon';
import { TriInputModule } from '@gradii/triangle/input';
import { SearchComponent } from './search.component';

/**
 * <!-- example(search:search-basic-example) -->
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TriCommonModule,
    TriIconModule,
    TriInputModule
  ],
  exports     : [
    SearchComponent,
  ],
  declarations: [
    SearchComponent,
  ]
})
export class TriSearchModule {
}
