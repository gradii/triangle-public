/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AfterViewChecked, AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ListenerHandle } from '../../../canvas-core/core/base-observer';
import { ENGINE } from '../../../canvas-core/tokens';
import { Toolkit } from '../../../canvas-core/toolkit';
import { DiagramEngine } from '../../diagram-engine';
import { PortModel } from './port-model';


export class PortRef {
  constructor(public element: ElementRef) {
  }
}

@Component({
  selector : 'tri-port-widget',
  template : `
    <ng-content></ng-content>
  `,
  styleUrls: ['./port-widget.scss'],
  host     : {
    'class'              : 'port port-widget',
    '[class.port-linked]': 'port.getLinks().length',
    '[attr.data-name]'   : 'port.getName()',
    '[attr.data-nodeid]' : 'port.getNode().getID()'
  }
})
export class PortWidget implements OnInit, AfterViewInit, OnDestroy, AfterViewChecked {
  @Input() port: PortModel;

  private engineListenerHandle: ListenerHandle;
  private _canvasReady: boolean;

  constructor(@Inject(ENGINE) public engine: DiagramEngine,
              private elementRef: ElementRef
  ) {
  }

  report() {
    this.port.updateCoords(this.engine.getPortCoords(this.port, this.elementRef.nativeElement));
  }

  getExtraProps() {
    if (Toolkit.USE_NUM) {
      const links = Object.keys(this.port.getNode().getPort(this.port.getName()).links).join(',');
      return {
        'data-links': links
      };
    }
    return {};
  }

  ngAfterViewChecked() {
    if (this._canvasReady) {
      if (!this.port.reportedPosition) {
        this.report();
      }
      // this.report();
    }
  }

  ngOnInit(): void {
    this.engineListenerHandle = this.engine.registerListener({
      canvasReady: () => {
        this._canvasReady = true;
        this.report();
      }
    });
  }

  ngAfterViewInit() {
    if (this.engine.getCanvas()) {
      this.report();
    }
  }

  ngOnDestroy() {
    if (this.engineListenerHandle) {
      this.engineListenerHandle.deregister();
      this.engineListenerHandle = undefined;
    }
  }

}
