/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';

type Attr = {
  id: string | number,
  value: any
  offset: number,
  style: any
  classes: any
}

@Component({
  selector     : 'tri-slider-step',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div class="{{prefixCls}}-step">
          <span *ngFor="let attr of attrs; trackBy: trackById" [ngClass]="attr.classes"
                [ngStyle]="attr.style"></span>
    </div>
  `
})
export class SliderStepComponent implements OnInit, OnChanges {
  // Dynamic properties
  @Input() lowerBound: number = null;
  @Input() upperBound: number = null;

  // Static properties
  @Input() prefixCls: string;
  @Input() vertical: boolean;
  @Input() marksArray: any[];
  @Input() included: boolean;

  attrs: Attr[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lowerBound || changes.upperBound) {
      this.togglePointActive();
    }
  }

  ngOnInit() {
    const orient    = this.vertical ? 'bottom' : 'left',
          prefixCls = this.prefixCls;
    this.attrs = this.marksArray.map(mark => {
      const {value, offset} = mark;
      return {
        id     : value,
        value  : value,
        offset : offset,
        style  : {
          [orient]: `${offset}%`
        },
        classes: {
          [`${prefixCls}-dot`]       : true,
          [`${prefixCls}-dot-active`]: false
        }
      };
    });
    this.togglePointActive();
  }

  trackById(index: number, attr: Attr) {
    return attr.id;
  }

  togglePointActive() {
    const {prefixCls, attrs, lowerBound, upperBound, included} = this;
    if (attrs && lowerBound !== null && upperBound !== null) {
      attrs.forEach(attr => {
        const value    = attr.value,
              isActive = (!included && value === upperBound) || (included && value <= upperBound && value >= lowerBound);
        attr.classes[`${prefixCls}-dot-active`] = isActive;
      });
    }
  }
}
