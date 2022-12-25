/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { COMPOSITION_BUFFER_MODE, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Ng2DropdownModule } from 'ng2-material-dropdown';
import { TagInputDropdown } from './components/dropdown/tag-input-dropdown.component';
import { DeleteIconComponent } from './components/icon/icon';
import { TagInputForm } from './components/tag-input-form/tag-input-form.component';
import { TagInputComponent } from './components/tag-input/tag-input';
import { TagRipple } from './components/tag/tag-ripple.component';
import { TagComponent } from './components/tag/tag.component';
import { HighlightPipe } from './core/pipes/highlight.pipe';
import { DragProvider } from './core/providers/drag-provider';
import { Options, OptionsProvider } from './core/providers/options-provider';

const optionsProvider = new OptionsProvider();


/**
 * <!-- example(tag-list:tag-list-basic-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Ng2DropdownModule
  ],
  declarations: [
    TagInputComponent,
    DeleteIconComponent,
    TagInputForm,
    TagComponent,
    HighlightPipe,
    TagInputDropdown,
    TagRipple
  ],
  exports     : [
    TagInputComponent,
    DeleteIconComponent,
    TagInputForm,
    TagComponent,
    HighlightPipe,
    TagInputDropdown,
    TagRipple
  ],
  providers   : [
    DragProvider,
    {provide: COMPOSITION_BUFFER_MODE, useValue: false},
  ]
})
export class TriTagListModule {
  /**
   * @name withDefaults
   * @param options {Options}
   */
  public static withDefaults(options: Options): void {
    optionsProvider.setOptions(options);
  }
}
