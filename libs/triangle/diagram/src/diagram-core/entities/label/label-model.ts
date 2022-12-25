/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DeserializeContext } from '../../../canvas-core/core-models/base-entity';
import {
  BaseModel, BaseModelGenerics, BaseModelOptions
} from '../../../canvas-core/core-models/base-model';
import { LinkModel } from '../link/link-model';

export interface LabelModelOptions extends BaseModelOptions {
  offsetX?: number;
  offsetY?: number;
}

export interface LabelModelGenerics extends BaseModelGenerics {
  PARENT: LinkModel;
  OPTIONS: LabelModelOptions;
}

export class LabelModel<G extends LabelModelGenerics = LabelModelGenerics> extends BaseModel<G> {

  offsetX: number = 0;
  offsetY: number = 0;

  constructor({
                offsetX = 0,
                offsetY = 0,
                ...rest
              }: G['OPTIONS']) {
    super(rest);

    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.offsetX = data.offsetX;
    this.offsetY = data.offsetY;
  }

  serialize() {
    return {
      ...super.serialize(),
      offsetX: this.offsetX,
      offsetY: this.offsetY
    };
  }
}
