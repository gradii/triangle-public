/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Rectangle } from '@gradii/vector-math';
import { BaseModel } from '../core-models/base-model';
import {
  AbstractDisplacementState, AbstractDisplacementStateEvent
} from '../core-state/abstract-displacement-state';
import { State } from '../core-state/state';
import { ModelGeometryInterface } from '../core/model-geometry-interface';
import { SelectionLayerModel } from '../entities/selection/selection-layer-model';

export type ParticleClientRect = Pick<ClientRect, 'left' |
  'top' |
  'width' |
  'height' |
  'right' |
  'bottom'>;

export class SelectionBoxState extends AbstractDisplacementState {
  layer: SelectionLayerModel;

  boxSelection: Set<BaseModel> = new Set();

  constructor() {
    super({
      name: 'selection-box'
    });
  }

  activated(previous: State) {
    super.activated(previous);
    this.boxSelection.clear();

    this.layer = new SelectionLayerModel();
    this.engine.getModel().addLayer(this.layer);
  }

  deactivated(next: State) {
    super.deactivated(next);

    this.engine.fireEvent({
      selection: Array.from(this.boxSelection),
    }, 'selection');

    this.boxSelection.clear();

    this.layer.remove();
    this.engine.repaintCanvas();
  }

  getBoxDimensions(event: AbstractDisplacementStateEvent): ParticleClientRect {
    const rel = this.engine.getRelativePoint(event.event.clientX, event.event.clientY);

    return {
      left  : rel.x > this.initialXRelative ? this.initialXRelative : rel.x,
      top   : rel.y > this.initialYRelative ? this.initialYRelative : rel.y,
      width : Math.abs(rel.x - this.initialXRelative),
      height: Math.abs(rel.y - this.initialYRelative),
      right : rel.x < this.initialXRelative ? this.initialXRelative : rel.x,
      bottom: rel.y < this.initialYRelative ? this.initialYRelative : rel.y
    };
  }

  fireMouseMoved(event: AbstractDisplacementStateEvent) {
    this.layer.setBox(this.getBoxDimensions(event));

    const relative = this.engine.getRelativePointFromClientRect({
      clientX: this.initialX,
      clientY: this.initialY
    });
    if (event.virtualDisplacementX < 0) {
      relative.x -= Math.abs(event.virtualDisplacementX);
    }
    if (event.virtualDisplacementY < 0) {
      relative.y -= Math.abs(event.virtualDisplacementY);
    }

    const rect = Rectangle.createFromBounds(relative.x, relative.y,
      Math.abs(event.virtualDisplacementX), Math.abs(event.virtualDisplacementY));

    for (const model of this.engine.getModel().getSelectionEntities()) {
      if (((model as unknown) as ModelGeometryInterface).getBoundingBox) {
        const bounds = ((model as unknown) as ModelGeometryInterface).getBoundingBox();
        if (rect.containsPoint(bounds.getTopLeft()) && rect.containsPoint(
          bounds.getBottomRight())) {
          model.setSelected(true);
          this.boxSelection.add(model);
        } else {
          model.setSelected(false);
          this.boxSelection.delete(model);
        }
      }
    }

    this.engine.repaintCanvas();
  }
}
