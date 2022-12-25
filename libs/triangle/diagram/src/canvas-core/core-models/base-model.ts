/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Subject } from 'rxjs';
import { toUniqueType } from '../../utils';
import { CanvasModel } from '../entities/canvas/canvas-model';
import {
  BaseEntity, BaseEntityEvent, BaseEntityGenerics, BaseEntityListener, BaseEntityOptions,
  DeserializeContext
} from './base-entity';

export interface BaseModelEvent<T extends BaseEntity = BaseEntity> extends BaseEntityEvent<T> {
  modelFiring: boolean;
  stopModelPropagation: () => void;
}


export interface BaseModelListener extends BaseEntityListener {
  selectionChanged?: (event: BaseEntityEvent<BaseModel> & { isSelected: boolean }) => void;

  entityRemoved?: (event: BaseEntityEvent<BaseModel>) => void;
  entityAdded?: (event: BaseEntityEvent<BaseModel>) => void;
}

export interface BaseModelOptions extends BaseEntityOptions {
  type?: string;
  selected?: boolean;
  extras?: any;
}

export interface BaseModelGenerics extends BaseEntityGenerics {
  LISTENER: BaseModelListener;
  PARENT: BaseEntity;
  OPTIONS: BaseModelOptions;
}

export class BaseModel<G extends BaseModelGenerics = BaseModelGenerics> extends BaseEntity<G> {
  protected parent: G['PARENT'];

  // region
  type: string;
  selected: boolean;
  extras: any;

  // endreion

  selectionChanged = new Subject();

  constructor({
                type,
                selected,
                extras,
                ...rest
              }: BaseModelOptions) {
    super(rest);

    this.type     = type;
    this.selected = selected;
    this.extras   = extras;
  }

  performanceTune() {
    return true;
  }

  getParentCanvasModel(): CanvasModel {
    if (!this.parent) {
      return null;
    }
    if (this.parent instanceof CanvasModel) {
      return this.parent;
    } else if (this.parent instanceof BaseModel) {
      return this.parent.getParentCanvasModel();
    }
    return null;
  }

  getParent(): G['PARENT'] {
    return this.parent;
  }

  setParent(parent: G['PARENT']) {
    this.parent = parent;
  }

  getSelectionEntities(): BaseModel[] {
    return [this];
  }

  serialize() {
    return {
      ...super.serialize(),
      type    : this.type,
      selected: this.selected,
      extras  : this.extras,
    };
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);

    this.type     = data.type;
    this.extras   = data.extras;
    this.selected = data.selected;
  }

  getType(): string {
    return this.type;
    // return this.options.type;
  }

  isSelected(): boolean {
    // return this.options.selected;
    return this.selected;
  }

  isLocked(): boolean {
    const locked = super.isLocked();
    if (locked) {
      return true;
    }

    // delegate this call up to the parent
    if (this.parent) {
      return this.parent.isLocked();
    }
    return false;
  }

  setSelected(selected: boolean = true) {
    if (
      this.selected !== selected
    ) {
      this.selected = selected;

      this.selectionChanged.next({
        isSelected: selected
      })
      this.fireEvent(
        {
          isSelected: selected
        },
        'selectionChanged'
      );
    }
  }

  remove() {
    this.fireEvent({}, 'entityRemoved');
  }

  fireEvent<L extends Partial<BaseEntityEvent> & object>(event: L, k: keyof G['LISTENER']) {
    const firedEvent = {
      modelFiring         : true,
      stopModelPropagation: () => {
        firedEvent.modelFiring = false;
      },
      entity              : this,
      ...event
    } as BaseModelEvent;
    super.fireEvent(
      firedEvent,
      k
    );
    if (this.parent && firedEvent.modelFiring) {
      this.parent.fireEvent(firedEvent, k as string);
    }
  }
}
