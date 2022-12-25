/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { DatePipe } from './pipe/date.pipe';
import { SafeUrlPipe } from './pipe/safe-url.pipe';

/**
 * <!-- example(util:util-basic-example) -->
 */
@NgModule({
  declarations: [DatePipe, SafeUrlPipe],
  exports     : [DatePipe, SafeUrlPipe]
})
export class TriUtilModule {
}
