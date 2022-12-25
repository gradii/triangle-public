/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Injectable } from '@angular/core';
import { Action, ActionEvent, InputType } from '../../canvas-core/core-actions/action';
import { MoveItemsState } from '../../canvas-core/states/move-items-state';
import { DiagramEngine } from '../diagram-engine';
import { LinkModel } from '../entities/link/link-model';
import { PointModel } from '../entities/link/point-model';
import { PortModel } from '../entities/port/port-model';

// todo refactor use injectable to instant state
@Injectable()
export class DragDiagramItemsState extends MoveItemsState<DiagramEngine> {
  constructor() {
    super();
    this.registerAction(
      new Action({
        type: InputType.MOUSE_UP,
        fire: (event: ActionEvent<MouseEvent>) => {
          const item = this.engine.getMouseElement(event.event);
          if (item instanceof PortModel) {
            Object.values(this.initialPositions).forEach((position) => {
              if (position.item instanceof PointModel) {
                const link = position.item.getParent() as LinkModel;

                // only care about the last links
                if (link.getLastPoint() !== position.item) {
                  return;
                }
                if (item.canSourcePortAcceptLink(link)) {
                  link.setTargetPort(item);
                  item.reportPosition();
                  this.engine.repaintCanvas();
                }
              }
            });
          }
        }
      })
    );
  }
}
