/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { deepClone as cloneDeep } from '@gradii/nanofn';
import { CanvasEngine } from '../canvas-engine';
import { BaseEvent, BaseListener, BaseObserver } from '../core/base-observer';
import { Toolkit } from '../toolkit';
import { BaseModel } from './base-model';

export interface BaseEntityEvent<T extends BaseEntity = BaseEntity> extends BaseEvent {
  entity: T;
}

export interface BaseEntityListener<T extends BaseEntity = BaseEntity> extends BaseListener {
  lockChanged?: (event: BaseEntityEvent<T> & { locked: boolean }) => void;
}

export type BaseEntityType = 'node' | 'link' | 'port' | 'point';

export interface BaseEntityOptions {
  id?: string;
  locked?: boolean;
}

export type BaseEntityGenerics = {
  LISTENER: BaseEntityListener;
  OPTIONS: BaseEntityOptions;
};

export interface DeserializeContext<T extends BaseEntity = BaseEntity> {
  engine: CanvasEngine;

  // data: ReturnType<T['serialize']>;

  registerModel(model: BaseModel): any;

  getModel<M extends BaseModel>(id: string, cb: (m: M) => void): void;
}

export class BaseEntity<T extends BaseEntityGenerics = BaseEntityGenerics> extends BaseObserver<T['LISTENER']> {
  /**
   * @deprecated
   */
  protected options: T['OPTIONS'];

  // region options area
  id: string = Toolkit.UID();
  locked: boolean;

  // endregion

  constructor({
                id = Toolkit.UID(),
                locked
              }: T['OPTIONS'] = {}) {
    super();
    this.id     = id;
    this.locked = locked;
  }

  getID() {
    return this.id;
    // return this.id;
  }

  doClone(lookupTable: { [s: string]: any } = {}, clone: any) {
    /*noop*/
  }

  clone(lookupTable: { [s: string]: any } = {}) {
    // try and use an existing clone first
    if (lookupTable[this.id]) {
      return lookupTable[this.id];
    }
    const clone = cloneDeep(this);
    clone.id    = Toolkit.UID();
    clone.clearListeners();
    lookupTable[this.id] = clone;

    this.doClone(lookupTable, clone);
    return clone;
  }

  clearListeners() {
    this.listeners = {};
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    // this.id     = event.data.id;
    // this.options.locked = event.data.locked;

    this.id     = data.id;
    this.locked = data.locked;
  }

  serialize() {
    return {
      // id    : this.id,
      // locked: this.locked,
      id    : this.id,
      locked: this.locked,
      // id    : this.id,
      // locked: this.options.locked
    };
  }

  fireEvent<L extends Partial<BaseEntityEvent> & object>(event: L, k: keyof T['LISTENER']) {
    super.fireEvent(
      {
        entity: this,
        ...event
      } as BaseEntityEvent,
      k
    );
  }

  isLocked(): boolean {
    return this.locked;
    // return this.options.locked;
  }

  setLocked(locked: boolean = true) {
    // this.options.locked = locked;
    this.locked = locked;

    this.fireEvent(
      {
        locked: locked
      },
      'lockChanged'
    );
  }
}
