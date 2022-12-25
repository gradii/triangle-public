/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BaseModelListener } from '../../../canvas-core/core-models/base-model';
import {
  BasePositionModel, BasePositionModelGenerics, BasePositionModelOptions
} from '../../../canvas-core/core-models/base-position-model';
import { LinkModel } from './link-model';

export interface PointModelOptions extends Omit<BasePositionModelOptions, 'type'> {
  link: LinkModel;
  type?: string;
}

export interface PointModelGenerics {
  PARENT: LinkModel;
  OPTIONS: PointModelOptions;
  LISTENER: BaseModelListener;
}

export class PointModel<G extends PointModelGenerics = PointModelGenerics>
  extends BasePositionModel<G & BasePositionModelGenerics> {
  constructor({
                link,
                type = 'point',
                ...rest
              }: G['OPTIONS']) {
    super(rest);
    this.parent = link;
    this.type   = type;
  }

  setPosition(x: any, y?: any) {
    super.setPosition(x, y);
    this.parent.innerPortChanged();
  }

  isConnectedToPort(): boolean {
    return this.parent.getPortForPoint(this) !== null;
  }

  getLink(): LinkModel {
    return this.getParent();
  }

  remove() {
    // clear references
    if (this.parent) {
      this.parent.removePoint(this);
    }
    super.remove();
  }

  isLocked() {
    return super.isLocked() || this.getParent().isLocked();
  }
}
