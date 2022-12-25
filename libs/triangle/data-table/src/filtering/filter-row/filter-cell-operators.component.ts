/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector           : 'tri-data-table-filter-cell-operators',
  template           : `
                         <tri-select
                           *ngIf="showOperators"
                           [ngModel]="value"
                           (ngModelChange)="onChange($event)"
                         >
                           <!--
                           [data]="operators"
                           class="tri-dropdown-operator"
                           (valueChange)="onChange($event)"
                           [value]="value"
                           [iconClass]="'tri-i-filter'"
                           [valuePrimitive]="true"
                           [textField]="'text'"
                           [popupSettings]="{ width: 'auto' }"
                           [valueField]="'value'"
                           -->
                           <tri-option *ngFor="let item of operators" [value]="item['value']">{{item['label']}}</tri-option>
                         </tri-select>
                         <button *ngIf="showButton"
                                 type="button"
                                 class="tri-button tri-button-icon"
                                 title="Clear"
                                 (click)="clearClick()">
                           <span class="tri-icon tri-i-filter-clear"></span>
                         </button>
                       `
})
export class FilterCellOperatorsComponent {
  @Input()
  operators: Array<{
    label: string;
    value: string;
  }> = [];

  @Input() showButton: boolean;
  @Input() showOperators: boolean = true;
  @Input() value: string;

  @Output() valueChange: EventEmitter<string> = new EventEmitter();
  @Output() clear: EventEmitter<{}> = new EventEmitter();

  constructor() {
  }

  @HostBinding('class.tri-filtercell-operator')
  get hostClasses() {
    return true;
  }

  onChange(dataItem: any): void {
    this.valueChange.emit(dataItem);
  }

  clearClick() {
    this.clear.emit();
  }
}
