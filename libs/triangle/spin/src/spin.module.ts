/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SpinComponent } from './spin.component';


/**
 *
 * # Spin is loading
 * Loading state for pages and blocks.
 * ### When to use
 * When the page is partially waiting for asynchronous data or is being rendered, appropriate loading animations can effectively relieve the user's anxiety.
 * ### Code demo
 *
 * A simple loading state.
 * <!-- example(spin:spin-basic-example) -->
 * Put into a container.
 * <!-- deprecated-example(spin:spin:spin-inside) -->
 * Custom description text, the specified tip text will directly replace `...`
 * <!-- deprecated-example(spin:spin:spin-tip) -->
 * Small is for text loading, default is for card container-level loading, and large is for page-level loading.
 * <!-- deprecated-example(spin:spin:spin-size) -->
 * You can directly embed content into a `tri-spin` to turn an existing container into a loaded state.
 * <!-- deprecated-example(spin:spin:spin-nested) -->
 */
@NgModule({
  exports     : [SpinComponent],
  declarations: [SpinComponent],
  imports     : [CommonModule]
})
export class TriSpinModule {
}
