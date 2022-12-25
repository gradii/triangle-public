/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Vector2 } from '@gradii/vector-math';
import { CanvasEngine } from '../canvas-engine';
import { Action, ActionEvent, InputType } from '../core-actions/action';
import { BaseModel } from '../core-models/base-model';
import { BasePositionModel } from '../core-models/base-position-model';
import {
  AbstractDisplacementState, AbstractDisplacementStateEvent
} from '../core-state/abstract-displacement-state';
import { State } from '../core-state/state';

export class MoveItemsState<E extends CanvasEngine = CanvasEngine> extends AbstractDisplacementState<E> {
  initialPositions: {
    [id: string]: {
      point: Vector2;
      item: BaseModel;
    };
  };

  constructor() {
    super({
      name: 'move-items'
    });
    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: (event: ActionEvent<MouseEvent>) => {
          const element = this.engine.getActionEventBus().getModelForEvent(event);
          if (!element) {
            return;
          }
          if (!element.isSelected()) {
            this.engine.getModel().clearSelection();
          }
          element.setSelected(true);

          this.engine.fireEvent({
            selection: [element]
          }, 'selection');

          this.engine.repaintCanvas();
        }
      })
    );
  }

  activated(previous: State) {
    super.activated(previous);
    this.initialPositions = {};
  }

  fireMouseMoved(event: AbstractDisplacementStateEvent) {
    const items = this.engine.getModel().getSelectedEntities();
    const model = this.engine.getModel();
    for (const item of items) {
      if (item instanceof BasePositionModel) {
        if (item.isLocked()) {
          continue;
        }
        if (!this.initialPositions[item.getID()]) {
          this.initialPositions[item.getID()] = {
            point: item.getPosition(),
            item : item
          };
        }

        const pos = this.initialPositions[item.getID()].point;
        item.setPosition(
          model.getGridPosition(pos.x + event.virtualDisplacementX),
          model.getGridPosition(pos.y + event.virtualDisplacementY)
        );
      }
    }
    this.engine.repaintCanvas();
  }
}
