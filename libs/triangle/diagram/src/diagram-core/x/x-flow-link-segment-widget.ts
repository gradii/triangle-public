/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { DiagramLinkModel } from '../../models/diagram-link-model';
import { DiagramEngine } from '../diagram-engine';

// export interface DefaultLinkSegmentWidgetProps {
//   path: string;
//   link: DefaultLinkModel;
//   selected: boolean;
//   forwardRef: React.RefObject<SVGPathElement>;
//   factory: DefaultLinkFactory;
//   diagramEngine: DiagramEngine;
//   onSelection: (selected: boolean) => any;
//   extras: object;
// }


@Component({
  selector: 'svg:g[tri-x-flow-link-segment-widget]',
  template: `

    <svg:path *ngIf="(selected || link.isSelected())"
      [attr.data-linkid]="this.link.getID()"
      [ref]="ref"
      class="path"
      [attr.stroke]="((selected || link.isSelected()) ? link.selectedColor : link.color)"
      [attr.stroke-width]="link.width"
      [attr.d]="path"
    >
    </svg:path>

    <svg:path
      [attr.data-linkid]="this.link.getID()"
      [ref]="ref"
      [ngStyle]="{
        strokeDasharray: '10, 2',
		    animation: 'animation-selected 3s linear infinite'
      }"
      class="path"
      [attr.stroke]="'rgb(0,192,255,0.5)'"
      [attr.stroke-width]="link.width + 15"
      [attr.d]="path"
    >
    </svg:path>
  `,
  styles  : [
    `
      .path {
        fill           : none;
        pointer-events : all;
      }
      
      @keyframes animation-selected {
        0% {
          stroke-dashoffset: 24;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
    `
  ]
})
export class XLinkSegmentWidget {

  @Input() ref: (ref: SVGPathElement) => void;
  @Input() path: string;
  @Input() link: DiagramLinkModel;
  @Input() selected: boolean;
  @Input() forwardRef: ElementRef<SVGPathElement>;
  // @Input() factory: DefaultLinkFactory;
  @Input() diagramEngine: DiagramEngine;
  @Input() extras: object;

  @Input() onSelection: (selected: boolean) => any;

  @Output() selection = new EventEmitter();

  renderHandle() {

    const topProps = {
      strokeLinecap: 'round',
      onMouseLeave : () => {
        this.onSelection(false);
      },
      onMouseEnter : () => {
        this.onSelection(true);
      },
      ...this.extras,
      // ref: null,
      'data-linkid': this.link.getID(),
      strokeOpacity: this.selected ? 0.1 : 0,
      strokeWidth  : 20,
      fill         : 'none',
      onContextMenu: (event: Event) => {
        if (!this.link.isLocked()) {
          event.preventDefault();
          this.link.remove();
        }
      }
    };


    // render() {
    //   const Bottom = React.cloneElement(
    //     this.factory.generateLinkSegment(
    //       this.link,
    //       this.selected || this.link.isSelected(),
    //       this.path
    //     ),
    //     {
    //       ref: this.forwardRef
    //     }
    //   );
    //
    //   const Top = React.cloneElement(Bottom, {
    //     strokeLinecap: 'round',
    //     onMouseLeave: () => {
    //       this.onSelection(false);
    //     },
    //     onMouseEnter: () => {
    //       this.onSelection(true);
    //     },
    //     ...this.extras,
    //     ref: null,
    //     'data-linkid': this.link.getID(),
    //     strokeOpacity: this.selected ? 0.1 : 0,
    //     strokeWidth: 20,
    //     fill: 'none',
    //     onContextMenu: () => {
    //       if (!this.link.isLocked()) {
    //         event.preventDefault();
    //         this.link.remove();
    //       }
    //     }
    //   });
    //
    //   return (
    //     <g>
    //       {Bottom}
    //       {Top}
    //     </g>
    //   );
    // }
  }
}
