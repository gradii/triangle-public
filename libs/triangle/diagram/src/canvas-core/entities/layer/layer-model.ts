/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import * as _ from '@gradii/nanofn';
import { CanvasEngine } from '../../canvas-engine';
import { DeserializeContext } from '../../core-models/base-entity';
// import { DeserializeEvent } from '../../core-models/base-entity';
import { BaseModel, BaseModelGenerics, BaseModelOptions } from '../../core-models/base-model';
// import { AbstractModelFactory } from '../../core/abstract-model-factory';
// import {
//   FactoryBank,
//   FactoryBankListener
// } from '../../core/factory-bank';
import { CanvasModel } from '../canvas/canvas-model';

export interface LayerModelOptions extends BaseModelOptions {
  isSvg?: boolean;
  transformed?: boolean;
}

export interface LayerModelGenerics extends BaseModelGenerics {
  OPTIONS: LayerModelOptions;
  PARENT: CanvasModel;
  CHILDREN: BaseModel;
  ENGINE: CanvasEngine;
}

export abstract class LayerModel<G extends LayerModelGenerics = LayerModelGenerics>
  extends BaseModel<G> {

  protected models: BaseModel[];
  protected repaintEnabled: boolean;

  //region
  isSvg: boolean;
  transformed: boolean;

  //endregion

  constructor({
                isSvg,
                transformed,
                ...rest
              }: LayerModelOptions = {}) {
    super(rest);
    this.models         = [];
    this.repaintEnabled = true;

    this.isSvg       = isSvg;
    this.transformed = transformed;
  }

  /**
   * This is used for deserialization
   */
  // abstract getChildModelFactoryBank(engine: G['ENGINE']): FactoryBank<AbstractModelFactory<BaseModel>, FactoryBankListener>;

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.isSvg       = !!data.isSvg;
    this.transformed = !!data.transformed;

    this.isSvg       = !!data.isSvg;
    this.transformed = !!data.transformed;
  }

  serialize() {
    return {
      ...super.serialize(),
      isSvg      : this.isSvg,
      transformed: this.transformed,
      models     : this.models.map((model) => {
        return model.serialize();
      })
    };
  }

  isRepaintEnabled() {
    return this.repaintEnabled;
  }

  allowRepaint(allow: boolean = true) {
    this.repaintEnabled = allow;
  }

  remove() {
    if (this.parent) {
      this.parent.removeLayer(this);
    }
    super.remove();
  }

  addModel(model: G['CHILDREN']) {
    model.setParent(this);
    this.models.push(model);
  }

  getSelectionEntities(): BaseModel[] {
    return this.models.flatMap((model) => {
      return model.getSelectionEntities();
    });
  }

  getModels() {
    return this.models;
  }

  getModel(id: string) {
    return this.models.find(it => it.getID() === id);
  }

  removeModel(id: string | G['CHILDREN']): boolean {
    const _id = typeof id === 'string' ? id : id.getID();
    const idx = this.models.findIndex(it => it.getID() === _id);
    if (idx > -1) {
      this.models.splice(idx, 1);
      return true;
    }
    return false;
  }
}
