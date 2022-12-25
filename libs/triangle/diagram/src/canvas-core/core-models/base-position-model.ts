/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Rectangle, Vector2 } from '@gradii/vector-math';
import { ModelGeometryInterface } from '../core/model-geometry-interface';
import { BaseEntityEvent, DeserializeContext } from './base-entity';
import { BaseModel, BaseModelGenerics, BaseModelListener, BaseModelOptions } from './base-model';

export interface BasePositionModelListener extends BaseModelListener {
  positionChanged?(event: BaseEntityEvent<BasePositionModel>): void;
}

export interface BasePositionModelOptions extends BaseModelOptions {
  position?: Vector2;

  data?: any;
}

export interface BasePositionModelGenerics extends BaseModelGenerics {
  LISTENER: BasePositionModelListener;
  OPTIONS: BasePositionModelOptions;
}

export class BasePositionModel<G extends BasePositionModelGenerics = BasePositionModelGenerics> extends BaseModel<G>
  implements ModelGeometryInterface {
  protected position: Vector2;

  constructor(options: BasePositionModelOptions) {
    super(options);
    this.position = options.position || new Vector2(0, 0);
  }

  setPosition(point: Vector2): void;
  setPosition(x: number, y: number): void;
  setPosition(x: number | Vector2, y?: number) {
    if (typeof x === 'object') {
      this.position = x;
    } else if (typeof x === 'number') {
      this.position = new Vector2(x, y);
    }
    this.fireEvent({position: this.position}, 'positionChanged');
  }

  getBoundingBox(): Rectangle {
    return Rectangle.createFromBounds(this.position.x, this.position.y, 0, 0);
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.position = new Vector2(
      data.x,
      data.y
    );
  }

  serialize() {
    return {
      ...super.serialize(),
      x: this.position.x,
      y: this.position.y
    };
  }

  getPosition(): Vector2 {
    return this.position;
  }

  getX() {
    return this.position.x;
  }

  getY() {
    return this.position.y;
  }
}
