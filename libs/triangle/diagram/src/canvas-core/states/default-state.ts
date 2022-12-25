/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Action, ActionEvent, InputType } from '../core-actions/action';
import { State } from '../core-state/state';
import { DragCanvasState } from './drag-canvas-state';
import { MoveItemsState } from './move-items-state';
import { SelectingState } from './selecting-state';

export class DefaultState extends State {
  constructor() {
    super({
      name: 'default'
    });
    this.childStates = [new SelectingState()];

    // determine what was clicked on
    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: (event: ActionEvent<MouseEvent>) => {
          const element = this.engine.getActionEventBus().getModelForEvent(event);

          // the canvas was clicked on, transition to the dragging canvas state
          if (!element) {
            this.transitionWithEvent(new DragCanvasState(), event);
          } else {
            this.transitionWithEvent(new MoveItemsState(), event);
          }
        }
      })
    );
  }
}
