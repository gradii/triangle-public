/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';

@Component({
  selector     : 'tri-slider-track',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div [class]="className" [ngStyle]="style"></div>
  `
})
export class SliderTrackComponent implements OnChanges {
  // Dynamic properties
  @Input() offset;
  @Input() length;

  // Static properties
  @Input() className;
  @Input() vertical;
  @Input() included;

  style: any = {};

  ngOnChanges(changes: SimpleChanges) {
    const {offset, length, included, vertical, style} = this;
    if (changes.nzIncluded) {
      style.visibility = included ? 'visible' : 'hidden';
    }
    if (changes.nzVertical || changes.nzOffset || changes.nzLength) {
      if (vertical) {
        style.bottom = `${offset}%`;
        style.height = `${length}%`;
      } else {
        style.left = `${offset}%`;
        style.width = `${length}%`;
      }
    }
  }
}
