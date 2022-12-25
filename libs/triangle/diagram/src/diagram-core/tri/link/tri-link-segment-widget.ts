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
  selector       : 'svg:g[tri-triangle-link-segment-widget]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `

    <svg:path
      [attr.data-linkid]="this.link.getID()"
      class="path path-bg"
      [attr.stroke-linecap]="'round'"
      [attr.stroke-opacity]="0"
      [attr.stroke-width]="8"
      [attr.d]="path"
    >
    </svg:path>
    
    <svg:path *ngIf="!(selected || link.isSelected())"
      class="path path-solid"
      [attr.stroke-width]="link.width"
      [attr.d]="path"
    >
    </svg:path>

    <svg:path *ngIf="(selected || link.isSelected())"
              class="path path-dashed"
              [attr.stroke-width]="link.width"
              [attr.d]="path"
    >
    </svg:path>
  `,
  styleUrls      : [
    `./tri-link-segment-widget.scss`
  ],

})
export class TriLinkSegmentWidget implements OnChanges {

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
