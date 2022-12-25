/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, EventEmitter, Inject, Input, OnInit, Self } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[triFilterInput], [tri-filter-input]'
})
export class FilterInputDirective implements OnInit {
  change: EventEmitter<string>;
  private accessor;

  constructor(@Self()
              @Inject(NG_VALUE_ACCESSOR)
                valueAccessors: ControlValueAccessor[]) {
    this.change = new EventEmitter();
    this.accessor = valueAccessors[0];
  }

  @Input()
  set value(value) {
    this.accessor.writeValue(value);
  }

  ngOnInit() {
    const _this = this;
    this.accessor.registerOnChange(x => _this.change.emit(x));
  }
}
