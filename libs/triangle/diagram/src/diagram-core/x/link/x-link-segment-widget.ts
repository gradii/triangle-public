/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ɵmarkDirty
} from '@angular/core';
import { ENGINE } from '../../../canvas-core/tokens';
import { DiagramLinkModel } from '../../../models/diagram-link-model';
import { DiagramEngine } from '../../diagram-engine';

@Component({
  selector       : 'svg:g[tri-x-link-segment-widget]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <svg:path
      [attr.data-linkid]="this.link.getID()"
      [ref]="ref"
      class="path path-bg"
      [attr.stroke-linecap]="'round'"
      [attr.stroke-opacity]="0"
      [attr.stroke-width]="8"
      [attr.d]="path"
    >
    </svg:path>

    <svg:g
      *ngFor="let it of totalArrows; trackBy: trackByFn"
      class="path path-arrow"
      [attr.transform]="it.translate + it.rotate"
    >
      <svg:path
        class="arrow-path"
        [attr.transform]="'translate(-4 -4)'"
        [attr.d]="'M4.31849 0H0.440754C0.268922 0 0.177086 0.202384 0.290238 0.3317L3.38476 3.8683C3.45074 3.9437 3.45074 4.0563 3.38476 4.1317L0.290238 7.6683C0.177086 7.79762 0.268922 8 0.440753 8H4.31849C4.43384 8 4.54357 7.95021 4.61952 7.8634L7.88476 4.1317C7.95074 4.0563 7.95074 3.9437 7.88476 3.8683L4.61952 0.136598C4.54357 0.0497922 4.43384 0 4.31849 0Z'">
      </svg:path>
    </svg:g>

    <svg:path *ngIf="(selected || link.isSelected())"
              [ref]="ref"
              class="path path-solid"
              [attr.stroke-width]="link.width"
              [attr.d]="path"
    >
    </svg:path>


  `,
  styleUrls      : ['./x-link-segment-widget.scss'],
})
export class XLinkSegmentWidget implements OnChanges {

  @Input() ref: (ref: SVGPathElement) => void;
  @Input() path: string;
  @Input() link: DiagramLinkModel;
  @Input() selected: boolean;
  @Input() forwardRef: ElementRef<SVGPathElement>;
  // @Input() factory: DefaultLinkFactory;
  @Input() diagramEngine: DiagramEngine;
  @Input() extras: object;

  @Output() selection = new EventEmitter();

  public totalArrows = [];
  trackByFn: any     = (index) => {
    return index;
  };

  constructor(@Inject(ENGINE) public engine: DiagramEngine) {
  }


  refresh() {
    const totalLength = this.link.curve.getTotalLength();
    this.totalArrows  = [];
    if (this.link && this.link.curve && this.link.curve.getPointAtLength) {

      for (let i = 0; i < totalLength; i = i + 8) {
        const point   = this.link.curve.getPointAtLength(i);
        const tangent = this.link.curve.getTangentAtLength(i);
        this.totalArrows.push({
          translate: `translate(${point.x}, ${point.y})`,
          rotate   : `rotate(${Math.atan2(tangent.y, tangent.x) * 180 / Math.PI})`
        });

      }
    }
  }

  ngAfterViewInit() {
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['path']) {
      this.refresh();
      ɵmarkDirty(this);
    }
  }

  renderHandle() {
  }
}
