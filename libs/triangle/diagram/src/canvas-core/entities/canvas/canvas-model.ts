/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CanvasEngine } from '../../canvas-engine';
import {
  BaseEntity, BaseEntityEvent, BaseEntityGenerics, BaseEntityListener, BaseEntityOptions, DeserializeContext
} from '../../core-models/base-entity';
import { BaseModel, BaseModelListener } from '../../core-models/base-model';
import { LayerModel } from '../layer/layer-model';

export interface DiagramListener extends BaseEntityListener {
  offsetUpdated?(event: BaseEntityEvent<CanvasModel> & { offsetX: number; offsetY: number }): void;

  zoomUpdated?(event: BaseEntityEvent<CanvasModel> & { zoom: number }): void;

  gridUpdated?(event: BaseEntityEvent<CanvasModel> & { size: number }): void;
}

export interface DiagramModelOptions extends BaseEntityOptions {
  offsetX?: number;
  offsetY?: number;
  zoom?: number;
  gridSize?: number;
}

export interface CanvasModelGenerics extends BaseEntityGenerics {
  LISTENER: DiagramListener;
  OPTIONS: DiagramModelOptions;
  LAYER: LayerModel;
}

export class CanvasModel<G extends CanvasModelGenerics = CanvasModelGenerics> extends BaseEntity<G> {
  protected layers: LayerModel[];

  // region options
  offsetX: number;
  offsetY: number;
  zoom: number;
  gridSize: number;

  // endregion

  engine: CanvasEngine;

  constructor({
                zoom = 100,
                offsetX = 0,
                offsetY = 0,
                gridSize = 0,
                ...rest
              }: DiagramModelOptions = {}) {
    super(rest);
    this.layers = [];

    this.offsetX  = offsetX;
    this.offsetY  = offsetY;
    this.zoom     = zoom;
    this.gridSize = gridSize;
  }

  attachEngine(engine: CanvasEngine) {
    this.engine = engine;
  }

  getSelectionEntities(): BaseModel[] {
    return this.layers.flatMap((layer) => {
      return layer.getSelectionEntities();
    });
  }

  getSelectedEntities(): BaseModel[] {
    return this.getSelectionEntities().filter((ob) => {
      return ob.isSelected();
    });
  }

  clearSelection() {
    this.getSelectedEntities().forEach((element) => {
      element.setSelected(false);
    });
  }

  getModels(): BaseModel[] {
    return this.layers.flatMap((layer) => {
      return layer.getModels();
    });
  }

  addLayer(layer: LayerModel) {
    layer.setParent(this);
    layer.registerListener({
      entityRemoved: (event: BaseEntityEvent<BaseModel>): void => {
      }
    } as BaseModelListener);
    this.layers.push(layer);
  }

  removeLayer(layer: LayerModel) {
    const index = this.layers.indexOf(layer);
    if (index !== -1) {
      this.layers.splice(index, 1);
      return true;
    }
    return false;
  }

  getLayers() {
    return this.layers;
  }

  setGridSize(size: number = 0) {
    this.gridSize = size;
    this.fireEvent({size: size}, 'gridUpdated');
  }

  getGridPosition(pos: number) {
    if (this.gridSize === 0) {
      return pos;
    }
    return this.gridSize * Math.floor(
      (pos + this.gridSize / 2) / this.gridSize);
  }

  deserializeModel(data: ReturnType<this['serialize']>, engine: CanvasEngine) {
    const models: {
      [id: string]: BaseModel;
    } = {};
    const resolvers: {
      [id: string]: Set<(model: BaseModel) => any>;
    } = {};

    const context: DeserializeContext = {
      engine       : engine,
      registerModel: (model: BaseModel) => {
        models[model.getID()] = model;
        if (resolvers[model.getID()]) {
          resolvers[model.getID()].forEach(cbFn => cbFn(model));
          resolvers[model.getID()].clear();
        }
      },
      getModel<T extends BaseModel>(id: string, cb: (m: any) => void): void {
        if (models[id]) {
          cb(models[id]);
          return;
        }
        if (!resolvers[id]) {
          resolvers[id] = new Set();
        }
        resolvers[id].add(cb);
      }
    };
    this.deserialize(data, context);
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.offsetX  = data.offsetX;
    this.offsetY  = data.offsetY;
    this.zoom     = data.zoom;
    this.gridSize = data.gridSize;
    // layers
  }

  serialize() {
    return {
      ...super.serialize(),
      offsetX : this.offsetX,
      offsetY : this.offsetY,
      zoom    : this.zoom,
      gridSize: this.gridSize,
      layers  : this.layers.map((layer) => {
        return layer.serialize();
      })
    };
  }

  setZoomLevel(zoom: number) {
    this.zoom = zoom;
    this.fireEvent({zoom}, 'zoomUpdated');
  }

  setOffset(offsetX: number, offsetY: number) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.fireEvent({offsetX, offsetY}, 'offsetUpdated');
  }

  setOffsetX(offsetX: number) {
    this.setOffset(
      offsetX,
      this.offsetY
    );
  }

  setOffsetY(offsetY: number) {
    this.setOffset(
      this.offsetX,
      offsetY
    );
  }

  getOffsetY() {
    return this.offsetY;
  }

  getOffsetX() {
    return this.offsetX;
  }

  getZoomLevel() {
    return this.zoom;
  }

  fireEvent<L extends Partial<BaseEntityEvent> & object>(event: L, k: keyof G['LISTENER']) {
    super.fireEvent(
      event,
      k
    );
    if (this.engine) {
      this.engine.fireEvent(event, k as string);
    }
  }
}
