/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Inject, Input, QueryList, ViewChildren } from '@angular/core';
import { Subject, tap } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ENGINE } from '../../canvas-core/tokens';
import { DiagramNodeModel } from '../../models/diagram-node-model';
import { DiagramEngine } from '../diagram-engine';
import { XPortLabelWidget } from './x-port-label-widget';

/**
 * Default node that models the DefaultNodeModel. It creates two columns
 * for both all the input ports on the left, and the output ports on the right.
 */
@Component({
  selector : 'x-node-widget',
  template : `
    <div (cdkObserveContent)="_onContentChangeSubject.next(null)">
      <div class="title">
        <div class="titleName">
          {{node.displayName}}
        </div>
      </div>
      <div class="description">
        {{node.description}}
      </div>
      <div class="ports">
        <div class="portsContainer">
          <ng-container *ngFor="let it of node.getInPorts()">
            <tri-x-port-label-widget [port]="it"></tri-x-port-label-widget>
          </ng-container>
        </div>
        <div class="portsContainer">
          <ng-container *ngFor="let it of node.getOutPorts()">
            <tri-x-port-label-widget [port]="it"></tri-x-port-label-widget>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  host     : {
    '[class.tri-diagram-node-selected]': 'node.isSelected()',
    // '[style.borderColor]'       : 'node.isSelected() ? selectedBorderColor : defaultBorderColor',
    // '[style.backgroundColor]'   : 'node.color',
    '[attr.dataDefaultNodeName]': 'node.displayName',
    '[attr.selected]'           : 'node.isSelected()',
  },
  styleUrls: ['./x-node-widget.scss'],
})
export class XNodeWidget {
  // @Input() defaultBorderColor  = '#e9e9e9';
  // @Input() selectedBorderColor = 'rgb(24,144,255)';

  @Input() node: DiagramNodeModel;

  @ViewChildren(XPortLabelWidget)
  ports: QueryList<XPortLabelWidget>;

  _onContentChangeSubject = new Subject<null>();

  _destroy$ = new Subject();

  constructor(@Inject(ENGINE) public engine: DiagramEngine) {
  }

  ngOnInit() {
    this._onContentChangeSubject.pipe(
      takeUntil(this._destroy$),
      debounceTime(200),
      tap(() => {
        this._onContentChanges();
      })
    ).subscribe();
  }

  _onContentChanges() {
    this.ports.forEach(it => it.report());
  }

  ngOnDestroy() {
    this._destroy$.complete();
  }
}
