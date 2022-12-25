/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Action, ActionEvent, InputType } from '../../canvas-core/core-actions/action';
import { State } from '../../canvas-core/core-state/state';
import { DragCanvasState } from '../../canvas-core/states/drag-canvas-state';
import { SelectingState } from '../../canvas-core/states/selecting-state';
import { DiagramEngine } from '../diagram-engine';
import { PortModel } from '../entities/port/port-model';
import { DragDiagramItemsState } from './drag-diagram-items-state';
import { DragNewLinkState } from './drag-new-link-state';

// todo refactor use injectable to instant state
@Injectable()
export class DefaultDiagramState extends State<DiagramEngine> {
  dragCanvas: DragCanvasState;
  dragNewLink: DragNewLinkState;
  dragItems: DragDiagramItemsState;

  constructor() {
    super({
      name: 'default-diagrams'
    });
    this.childStates = [new SelectingState()];
    this.dragCanvas  = new DragCanvasState();
    this.dragNewLink = new DragNewLinkState();
    this.dragItems   = new DragDiagramItemsState();

    // determine what was clicked on
    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: (event: ActionEvent<MouseEvent>) => {
          const element = this.engine.getActionEventBus().getModelForEvent(event);

          // the canvas was clicked on, transition to the dragging canvas state
          if (!element) {//drag canvas
            this.transitionWithEvent(this.dragCanvas, event);
          } else if (element instanceof PortModel) {//drag port model
            this.transitionWithEvent(this.dragNewLink, event);
          } else {//drag node item
            this.transitionWithEvent(this.dragItems, event);
          }
        }
      })
    );
  }
}
