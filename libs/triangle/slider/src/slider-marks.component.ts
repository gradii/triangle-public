/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector     : 'tri-slider-marks',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div [class]="className">
      <span *ngFor="let attr of attrs; trackBy: trackById" [ngClass]="attr.classes" [ngStyle]="attr.style" [innerHTML]="attr.label"></span>
    </div>
  `
})
export class SliderMarksComponent implements OnInit, OnChanges {
  // Dynamic properties
  @Input() lowerBound: number = null;
  @Input() upperBound: number = null;

  // Static properties
  @Input() className: string;
  @Input() vertical: boolean; // Required
  @Input() marksArray: MarksArray; // Required
  @Input() min: number; // Required
  @Input() max: number; // Required
  @Input() included: boolean;

  attrs; // points for inner use

  ngOnChanges(changes: SimpleChanges) {
    if (changes.lowerBound || changes.upperBound) {
      this.togglePointActive();
    }
  }

  ngOnInit() {
    const {vertical, className, marksArray, min, max, lowerBound, upperBound} = this;
    const range = max - min;
    this.attrs = marksArray.map(mark => {
      const {value, offset, config} = mark;
      // calc styles
      let label = config,
          style;
      if (vertical) {
        style = {
          marginBottom: '-50%',
          bottom      : `${(value - min) / range * 100}%`
        };
      } else {
        const marksCount = marksArray.length,
              unit       = 100 / (marksCount - 1),
              markWidth  = unit * 0.9;
        style = {
          width     : `${markWidth}%`,
          marginLeft: `${-markWidth / 2}%`,
          left      : `${(value - min) / range * 100}%`
        };
      }
      // custom configuration
      if (typeof config === 'object') {
        label = config.label;
        if (config.style) {
          style = {...style, ...config.style};
        }
      }
      return {
        id     : value,
        value  : value,
        offset : offset,
        classes: {
          [`${className}-text`]: true
        },
        style  : style,
        label  : label
      };
    }); // END - map
    this.togglePointActive();
  }

  trackById(index: number, attr) {
    return attr.id;
  }

  togglePointActive() {
    const {className, attrs, lowerBound, upperBound, included} = this;
    if (attrs && lowerBound !== null && upperBound !== null) {
      attrs.forEach(attr => {
        const value    = attr.value,
              isActive = (!included && value === upperBound) || (included && value <= upperBound && value >= lowerBound);
        attr.classes[`${className}-text-active`] = isActive;
      });
    }
  }
}

// DEFINITIONS

export type Mark =
  | string
  | {
  style: Object;
  label: string;
};

export type Marks = {
  [key: number]: Mark;
};

export class MarksArray extends Array<any> {
  [index: number]: {
    value: number;
    offset: number;
    config: Mark;
  };
}
