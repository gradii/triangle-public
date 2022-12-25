/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isArray, isNumber, isString } from '@gradii/nanofn';

type OptionDisplay = {
  isChecked: boolean,
  value: any,
  label?: string
};

@Component({
  selector     : 'tri-checkbox-group',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ul [class.tri-checkbox-list-inline]="direction === 'row'">
      <li
        *ngFor="let item of options_display; let i = index"
        [class.tri-checkbox-column-margin]="direction === 'column'"
        [ngStyle]="{ 'width.px': itemWidth }"
        [ngClass]="{ 'tri-checkbox-wrap': itemWidth !== undefined }"
      >
      <span>
        <tri-checkbox
          [name]="name"
          [label]="item.label"
          [(ngModel)]="item.isChecked"
          [disabled]="this.disabled ? true : item['value']['disabled']"
          (ngModelChange)="toggle($event, i)"
        >
          <ng-template
            [ngIf]="!!labelTemplate"
            [ngTemplateOutlet]="labelTemplate"
            [ngTemplateOutletContext]="{ $implicit: item, checked: item['isChecked'], disabled: disabled }"
          >
          </ng-template>
        </tri-checkbox>
      </span>
      </li>
    </ul>
  `,
  styleUrls    : ['../style/checkbox-group.scss'],
  providers    : [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxGroupComponent),
      multi      : true
    }
  ],
  host         : {
    '[class.tri-checkbox-group]': 'true'
  },
})
export class CheckboxGroupComponent implements OnChanges, ControlValueAccessor {
  @Input() name: string;
  @Input() itemWidth: number;
  @Input() direction: 'row' | 'column' = 'column';
  @Input() disabled                    = false;
  @Input() options: any[]              = [];
  @Input() filterKey: string           = 'value';
  @Input() labelKey: string            = 'label';
  @Input() labelTemplate: TemplateRef<any>;

  @Output() change: EventEmitter<boolean> = new EventEmitter<boolean>();

  values: (any | string)[] = [];

  options_display: OptionDisplay[] = [];

  private onChange = (_: any) => {
  };
  private onTouch  = () => {
  };

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.checkType();
    }
  }

  checkType() {
    this.options_display                     = [];
    const checkedRecord: Record<string, any> = {};
    this.values.forEach(item => {
      if (isString(item) || isNumber(item)) {
        checkedRecord[String(item)] = true;
      } else if (this.filterKey && item[this.filterKey]) {
        checkedRecord[item[this.filterKey]] = true;
      }
    });
    this.options.forEach(item => {
      const option: OptionDisplay = {isChecked: false, value: item};
      if (isString(item) || isNumber(item)) {
        option.label = String(item);
        if (checkedRecord[item]) {
          option.isChecked = true;
        }
      } else {
        if (this.labelKey && item[this.labelKey]) {
          option.label = item[this.labelKey];
        }

        if (this.filterKey && item[this.filterKey]) {
          if (!this.labelKey) {
            option.label = item[this.filterKey];
          }
          if (checkedRecord[item[this.filterKey]]) {
            option.isChecked = true;
          }
        } else {
          if (this.values.includes(item)) {
            option.isChecked = true;
          }
        }
      }

      this.options_display.push(option);
    });
  }

  writeValue(inputArray: any): void {
    if (inputArray && isArray(inputArray)) {
      this.values = inputArray;
      this.checkType();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  toggle(checked: boolean, index: number) {
    this.onChange(this.getCheckedArray());
    this.onTouch();
    this.change.next(!!this.options_display[index]);
  }

  getCheckedArray() {
    const checkedArray: any[] = [];
    this.options_display.forEach(item => {
      if (item.isChecked) {
        checkedArray.push(item.value);
      }
    });
    return checkedArray;
  }
}
