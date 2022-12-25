/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnDestroy } from '@angular/core';
import { ENGINE } from '../../canvas-core/tokens';
import { DiagramLinkModel } from '../../models/diagram-link-model';
import { DiagramEngine } from '../diagram-engine';
import { LinkModel } from '../entities/link/link-model';
import { PointModel } from '../entities/link/point-model';
import { TriLinkPointWidget } from './link/tri-link-point-widget';
import { TriLinkModule } from './tri-link.module';

export interface DefaultLinkProps {
  link: DiagramLinkModel;
  diagramEngine: DiagramEngine;
  pointAdded?: (point: PointModel, event: MouseEvent) => any;
}

export interface DefaultLinkState {
  selected: boolean;
}

@Component({
  selector       : 'svg:g[tri-triangle-link-widget]',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
<!--    <ng-template ngFor let-it [ngForOf]="svgPaths">-->
      <svg:g tri-triangle-link-segment-widget
             [path]="link.getSVGPath()"
             [selected]="selected"
             [link]="link"
             (selection)="selected = $event"
             (mousedown)="addPointToLink($event, 1);"
      >
      </svg:g>
<!--    </ng-template>-->

    <ng-template ngFor let-it [ngForOf]="pointPaths">
      <svg:g tri-triangle-link-point-widget
             [point]="it.point"
             [colorSelected]="it.colorSelected"
             [color]="it.color"
      >
      </svg:g>
    </ng-template>

    <ng-template ngFor let-it [ngForOf]="linkPaths">
      <svg:g tri-triangle-link-segment-widget
             [ref]="it.ref"
             [path]="link.getSVGPath()"
             [selected]="selected"
             [link]="link"
             (selection)="selected = $event"
             (mousedown)="addPointToLink($event, it.j + 1);"
      >
      </svg:g>
    </ng-template>
  `,
  standalone: true,
  imports: [
    CommonModule,
    TriLinkModule
  ],
  host           : {
    '[attr.data-default-link-test]': 'link.labelName'
  }
})
export class TriLinkWidget implements /*OnInit, */OnDestroy/*, AfterViewInit, AfterViewChecked*/ {

  // refPaths: SVGPathElement[] = [];

  @Input() link: DiagramLinkModel;
  // @Input() diagramEngine: DiagramEngine;
  @Input() pointAdded?: (point: PointModel, event: MouseEvent) => any;

  @Input() selected: boolean = false;

  svgPaths: any[]   = [];
  pointPaths: any[] = [];
  linkPaths: any[]  = [];

  constructor(@Inject(ENGINE) public engine: DiagramEngine) {
  }

  ngOnDestroy(): void {
    // this.link.setRenderedPaths([]);
  }

  addPointToLink(event: MouseEvent, index: number) {
    return; // not support

    if (
      (event.ctrlKey || event.metaKey) &&
      !this.link.isLocked() &&
      this.link.getPoints().length - 1 <= this.engine.getMaxNumberPointsPerLink()
    ) {
      const point = new PointModel({
        link    : this.link,
        position: this.engine.getRelativePointFromClientRect(event)
      });
      this.link.addPoint(point, index);
    }
  }

  generatePoint(point: PointModel) {
    return {
      component: TriLinkPointWidget,
      props    : {
        key          : point.getID(),
        point        : point as any,
        colorSelected: this.link.selectedColor,
        color        : this.link.color,
      }
    };
  }

  ngOnInit() {
    // ensure id is present for all points on the path
    const points  = this.link.getPoints();

    for (const it of points) {
      this.pointPaths.push({
        point        : it as any,
        colorSelected: this.link.selectedColor,
        color        : this.link.color,
      });
    }
  }

  static ngAcceptInputType_link: LinkModel;
}
