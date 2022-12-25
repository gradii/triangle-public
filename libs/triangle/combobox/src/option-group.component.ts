/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { ComboboxOptionComponent } from './combobox-option.component';

@Component({
  selector       : 'tri-combobox-option-group',
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl    : './option-group.component.html'
})
export class OptionGroupComponent {
  isLabelString = false;
  @ContentChildren(ComboboxOptionComponent) listOfOptionComponent: QueryList<ComboboxOptionComponent>;

  _label: string | TemplateRef<void>;

  get label(): string | TemplateRef<void> {
    return this._label;
  }

  @Input()
  set label(value: string | TemplateRef<void>) {
    this._label = value;
    this.isLabelString = !(this._label instanceof TemplateRef);
  }
}
