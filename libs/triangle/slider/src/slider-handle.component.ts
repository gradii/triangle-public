/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component, HostListener, Inject, Input, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import { TRI_INTERNAL_SLIDER } from './slider.types';
import { TooltipDirective } from '@gradii/triangle/tooltip';
import type { SliderComponent } from './slider.component';

@Component({
  selector     : 'tri-slider-handle',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <div #tooltip="triTooltip" *ngIf="tipFormatter !== null" [triTooltip]="tooltipTitle" [class]="className"
         [ngStyle]="style"></div>
    <div *ngIf="tipFormatter === null" [class]="className" [ngStyle]="style"></div>
  `
})
export class SliderHandleComponent implements OnInit, OnChanges {
  // Static properties
  @Input() className: string;
  @Input() vertical: boolean;
  @Input() offset: number;
  @Input() value: number; // [For tooltip]
  @Input() tipFormatter: Function; // [For tooltip]
  // Locals
  @ViewChild('tooltip', {static: false}) tooltip: TooltipDirective; // [For tooltip]
  tooltipTitle: string; // [For tooltip]
  style: any = {};

  constructor(@Inject(TRI_INTERNAL_SLIDER) private _slider: SliderComponent) {
  }

  @Input()
  set active(show: boolean) {
    // [For tooltip]
    if (this.tooltip) {
      if (show) {
        this.tooltip.show();
      } else {
        this.tooltip.hide();
      }
    }
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.offset) {
      this._updateStyle();
    }
    if (changes.value) {
      this._updateTooltipTitle(); // [For tooltip]
      // this._updateTooltipPosition(); // [For tooltip]
    }
  }

  // Hover to toggle tooltip when not dragging
  @HostListener('mouseenter', ['$event'])
  onMouseEnter($event) {
    if (!this._slider.isDragging) {
      this.active = true;
    }
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave($event) {
    if (!this._slider.isDragging) {
      this.active = false;
    }
  }

  private _updateTooltipTitle() {
    // [For tooltip]
    this.tooltipTitle = this.tipFormatter ? this.tipFormatter(this.value) : this.value;
  }

  // private _updateTooltipPosition() {
  //   // [For tooltip]
  //   if (this.tooltip) {
  //     window.setTimeout(() => this.tooltip.updatePosition(), 0); // MAY use ngAfterViewChecked? but this will be called so many times.
  //   }
  // }

  private _updateStyle() {
    this.style[this.vertical ? 'bottom' : 'left'] = `${this.offset}%`;
  }
}
