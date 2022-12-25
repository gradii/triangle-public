/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DeserializeContext } from '../canvas-core/core-models/base-entity';
import {
  LabelModel, LabelModelGenerics, LabelModelOptions
} from '../diagram-core/entities/label/label-model';


export interface DefaultLabelModelOptions extends LabelModelOptions {
  label?: string;
}

export interface DefaultLabelModelGenerics extends LabelModelGenerics {
  OPTIONS: DefaultLabelModelOptions;
}

export class DiagramLabelModel extends LabelModel<DefaultLabelModelGenerics> {

  // region options
  label: string;
  offsetY = -23;

  // endregion

  constructor({
                type = 'link-label',
                offsetY = -23,
                ...rest
              }: DefaultLabelModelOptions = {}) {
    super(rest);

    this.type    = type;
    this.offsetY = offsetY;
  }

  setLabel(label: string) {
    this.label = label;
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.label = data.label;
  }

  serialize() {
    return {
      ...super.serialize(),
      label: this.label
    };
  }
}
