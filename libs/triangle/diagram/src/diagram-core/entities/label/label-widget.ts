/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewChecked, Component, ElementRef, Inject, Input, NgZone, ViewChild
} from '@angular/core';
import { BezierCurve } from '@gradii/vector-math';
import { ENGINE } from '../../../canvas-core/tokens';
import { DiagramLinkModel } from '../../../models/diagram-link-model';
import { DiagramEngine } from '../../diagram-engine';
import { LabelModel } from './label-model';

@Component({
  selector: 'label-widget',
  template: `
    <div class="label" #ref>
      <x-label-widget [model]="label"></x-label-widget>
    </div>`,
  styles  : [
    `
      .label {
        display  : inline-block;
        position : absolute;
      }
    `
  ]
})
export class LabelWidget implements AfterViewChecked {
  @ViewChild('ref', {read: ElementRef, static: true})
  ref: ElementRef<any>;

  @Input()
  label: LabelModel;

  @Input()
  index: number;

  constructor(
    @Inject(ENGINE) public engine: DiagramEngine,
    private ngZone: NgZone
  ) {
  }

  get canvas() {
    return this.engine.getCanvas();
  }

  // ngOnInit() {
  //   window.requestAnimationFrame(this.calculateLabelPosition);
  // }

  ngAfterViewChecked() {
    this.ngZone.runOutsideAngular(() => {
      this.calculateLabelPosition();
    });
  }

  // @ts-ignore
  findPathAndRelativePositionToRenderLabel(index: number): { path: SVGPathElement | BezierCurve; position: number } {
    // an array to hold all path lengths, making sure we hit the DOM only once to fetch this information
    const link = this.label.getParent();
    if (link instanceof DiagramLinkModel) {
      const totalLength = link.curve.getTotalLength();
      return {
        path    : link.curve,
        position: totalLength / 2,
      };
    }

    // const lengths = link.getRenderedPath().map((path) => path.getTotalLength());
    //
    // // calculate the point where we want to display the label
    // let labelPosition =
    //       lengths.reduce((previousValue, currentValue) => previousValue + currentValue, 0) *
    //       (index / (link.getLabels().length + 1));
    //
    // // find the path where the label will be rendered and calculate the relative position
    // let pathIndex = 0;
    // while (pathIndex < link.getRenderedPath().length) {
    //   if (labelPosition - lengths[pathIndex] < 0) {
    //     return {
    //       path    : link.getRenderedPath()[pathIndex],
    //       position: labelPosition
    //     };
    //   }
    //
    //   // keep searching
    //   labelPosition -= lengths[pathIndex];
    //   pathIndex++;
    // }
  }

  calculateLabelPosition = () => {
    const found = this.findPathAndRelativePositionToRenderLabel(this.index + 1);
    if (!found) {
      return;
    }

    const {path, position} = found;

    const labelDimensions = {
      width : this.ref.nativeElement.offsetWidth,
      height: this.ref.nativeElement.offsetHeight
    };

    const pathCentre = path.getPointAtLength(position);

    const labelCoordinates = {
      x: pathCentre.x - labelDimensions.width / 2 + this.label.offsetX,
      y: pathCentre.y - labelDimensions.height / 2 + this.label.offsetY
    };

    this.ref.nativeElement.style.transform = `translate(${labelCoordinates.x}px, ${labelCoordinates.y}px)`;
  };

}
