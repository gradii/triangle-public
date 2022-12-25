/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Inject, Input, ViewChild } from '@angular/core';
import { ENGINE } from '../../canvas-core/tokens';
import { DiagramPortModel } from '../../models/diagram-port-model';
import { DiagramEngine } from '../diagram-engine';
import { PortWidget } from '../entities/port/port-widget';

@Component({
  selector: 'tri-x-port-label-widget',
  template: `
    <div class="port-label" [ngClass]="{in: port.in, out: !port.in}">
      <ng-container *ngIf="port.in">
        <tri-port-widget [triDiagramPortBinding]="port" [port]="port">
          <div class="port-inner port-inner-in" *ngIf="port.icon">
            <tri-icon [svgIcon]="port.icon"></tri-icon>
          </div>
          <div class="label">{{port.displayName}}</div>
        </tri-port-widget>
      </ng-container>
      <ng-container *ngIf="!port.in">
        <tri-port-widget [triDiagramPortBinding]="port" [port]="port">
          <div class="label">{{port.displayName}}</div>
          <div class="port-inner port-inner-out" *ngIf="port.icon">
            <tri-icon [svgIcon]="port.icon"></tri-icon>
          </div>
        </tri-port-widget>
      </ng-container>
    </div>
  `,
  styles  : [
    `
      .port-label {
        display     : flex;
        margin-top  : 1px;
        align-items : center;
      }
      
      .port-label.in {
        justify-content: flex-start;
      }
      
      .port-label.out {
        justify-content: flex-end;
      }
      

      .label {
        padding   : 0 5px;
        flex-grow : 1;
      }

    `
  ]
})
export class XPortLabelWidget {
  @Input() port: DiagramPortModel;

  @ViewChild(PortWidget, {static: false})
  portWidget: PortWidget;

  constructor(@Inject(ENGINE) public engine: DiagramEngine) {
  }

  report() {
    if (this.portWidget) {
      this.portWidget.report();
    }
  }
}
