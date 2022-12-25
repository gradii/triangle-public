/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { PseudoCheckbox } from './pseudo-checkbox/pseudo-checkbox';


@NgModule({
  exports     : [PseudoCheckbox],
  declarations: [PseudoCheckbox]
})
export class TriPseudoCheckboxModule {
}


export * from './pseudo-checkbox/pseudo-checkbox';
