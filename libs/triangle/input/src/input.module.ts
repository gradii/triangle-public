/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriFormFieldModule } from '@gradii/triangle/form-field';
import { TriIconModule } from '@gradii/triangle/icon';
import { InputGroupAddonAfterDirective, InputGroupAddonBeforeDirective, InputGroupComponent } from './input-group.component';
import { InputDirective } from './input.directive';
import { TextareaAutosizeDirective } from './textarea.directive';

/**
 *
 * # Input input box
 * Entering content through the mouse or keyboard is the most basic form field wrapper.
 * ### When to use
 *
 * When the user is required to enter form field content.
 * Provide combination input box, input box with search, and size selection.
 *
 * ### Code demo
 *
 * Basic use.
 * <!-- example(input:input-basic-example) -->
 * Used to configure some fixed combinations
 * <!-- example(input:input-add-on-example) -->
 * Input box with search button.
 * <!-- example(input:input-search-example) -->
 * The `nzAutosize` property applies to `textarea` nodes, and only the height changes automatically. Also `nzAutosize` can be set to an object specifying the minimum and maximum number of rows.
 * <!-- example(input:input-textarea-auto-size-example) -->
 * We define three sizes (large, default, small) for the `tri-input` input box, with heights of `32px` , `28px` and `22px` respectively.
 * <!-- example(input:input-size-example) -->
 * Combination display of input boxes.
 * <!-- example(input:input-group-example) -->
 * For multiline input, specify `type` as a special `textarea` .
 * <!-- example(input:input-textarea-example) -->
 *
 * <!-- example(input:input-readonly-example) -->
 * <!-- example(input:input-disabled-example) -->
 *
 * <!-- example(input:input-form-field-basic-example) -->
 */
@NgModule({
  imports     : [CommonModule, FormsModule, TriIconModule, TriFormFieldModule, TextFieldModule],
  declarations: [
    InputGroupComponent, InputDirective, TextareaAutosizeDirective,
    InputGroupAddonBeforeDirective, InputGroupAddonAfterDirective,
  ],
  exports     : [
    TriFormFieldModule,
    InputGroupComponent, InputDirective, TextareaAutosizeDirective,
    InputGroupAddonBeforeDirective, InputGroupAddonAfterDirective,
  ],
})
export class TriInputModule {
}
