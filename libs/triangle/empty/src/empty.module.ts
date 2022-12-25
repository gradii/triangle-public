/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { EmbedEmptyComponent } from './embed-empty.component';
import { EmptyComponent } from './empty.component';

/**
 * <!-- example(empty:empty-basic-example) -->
 */
@NgModule({
  imports     : [CommonModule, TriCommonModule, PortalModule, TriI18nModule],
  declarations: [EmptyComponent, EmbedEmptyComponent],
  exports     : [EmptyComponent, EmbedEmptyComponent, TriCommonModule]
})
export class TriEmptyModule {
}
