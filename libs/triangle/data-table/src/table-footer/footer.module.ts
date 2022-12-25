/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../table-shared/shared.module';
import { FooterComponent } from './footer.component';

@NgModule({
  declarations: [FooterComponent],
  exports     : [FooterComponent],
  imports     : [CommonModule, SharedModule]
})
export class FooterModule {
  static exports() {
    return [];
  }
}
