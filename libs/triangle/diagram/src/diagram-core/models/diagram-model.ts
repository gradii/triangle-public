/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  BaseEntityEvent, BaseEntityListener, DeserializeContext
} from '../../canvas-core/core-models/base-entity';
import { BaseModel } from '../../canvas-core/core-models/base-model';
import {
  CanvasModel, CanvasModelGenerics, DiagramModelOptions
} from '../../canvas-core/entities/canvas/canvas-model';
import { LayerModel } from '../../canvas-core/entities/layer/layer-model';
import { DefaultNodeModelOptions, DiagramNodeModel } from '../../models/diagram-node-model';
import { DiagramEngine } from '../diagram-engine';
import { LinkLayerModel } from '../entities/link-layer/link-layer-model';
import { LinkModel } from '../entities/link/link-model';
import { NodeLayerModel } from '../entities/node-layer/node-layer-model';
import { NodeModel } from '../entities/node/node-model';

export interface DiagramListener extends BaseEntityListener {
  nodesUpdated?(event: BaseEntityEvent & { node: NodeModel; isCreated: boolean }): void;

  linksUpdated?(event: BaseEntityEvent & { link: LinkModel; isCreated: boolean }): void;
}

export interface DiagramModelGenerics extends CanvasModelGenerics {
  LISTENER: DiagramListener;
}

export class DiagramModel<G extends DiagramModelGenerics = DiagramModelGenerics> extends CanvasModel<G> {
  protected activeNodeLayer: NodeLayerModel;
  protected activeLinkLayer: LinkLayerModel;

  protected options: DiagramModelOptions;

  engine: DiagramEngine;

  constructor(options = {}) {
    super(options);
    this.addLayer(new LinkLayerModel());
    this.addLayer(new NodeLayerModel());
  }

  // getModel(id) {
  //   return super.getModels()
  // }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    this.layers = [];
    super.deserialize(data, context);
    data.layers.forEach( (layer) => {
      let layerOb;
      if (layer.type === 'diagram-nodes') {
        layerOb = new NodeLayerModel();
      } else if (layer.type === 'diagram-links') {
        layerOb = new LinkLayerModel();
      }
      layerOb.deserialize(layer, context);
      this.addLayer(layerOb);
    });
  }

  addLayer(layer: LayerModel): void {
    super.addLayer(layer);
    if (layer instanceof NodeLayerModel) {
      this.activeNodeLayer = layer;
    }
    if (layer instanceof LinkLayerModel) {
      this.activeLinkLayer = layer;
    }
  }

  getLinkLayers(): LinkLayerModel[] {
    return this.layers.filter((layer) => {
      return layer instanceof LinkLayerModel;
    }) as LinkLayerModel[];
  }

  getNodeLayers(): NodeLayerModel[] {
    return this.layers.filter((layer) => {
      return layer instanceof NodeLayerModel;
    }) as NodeLayerModel[];
  }

  getActiveNodeLayer(): NodeLayerModel {
    if (!this.activeNodeLayer) {
      const layers = this.getNodeLayers();
      if (layers.length === 0) {
        this.addLayer(new NodeLayerModel());
      } else {
        this.activeNodeLayer = layers[0];
      }
    }
    return this.activeNodeLayer;
  }

  getActiveLinkLayer(): LinkLayerModel {
    if (!this.activeLinkLayer) {
      const layers = this.getLinkLayers();
      if (layers.length === 0) {
        this.addLayer(new LinkLayerModel());
      } else {
        this.activeLinkLayer = layers[0];
      }
    }
    return this.activeLinkLayer;
  }

  createNode(nodeOption: DefaultNodeModelOptions) {
    const node = new DiagramNodeModel(nodeOption);
    return this.addNode(node);
  }

  getNode(node: string): NodeModel {
    for (const layer of this.getNodeLayers()) {
      const model = layer.getModel(node);
      if (model) {
        return model;
      }
    }
    return undefined;
  }

  getLink(link: string): LinkModel {
    for (const layer of this.getLinkLayers()) {
      const model = layer.getModel(link);
      if (model) {
        return model;
      }
    }
    return undefined;
  }

  addAll(...models: BaseModel[]): BaseModel[] {
    models.forEach((model) => {
      if (model instanceof LinkModel) {
        this.addLink(model);
      } else if (model instanceof NodeModel) {
        this.addNode(model);
      }
    });
    return models;
  }

  addLink(link: LinkModel): LinkModel {
    this.getActiveLinkLayer().addModel(link);
    this.fireEvent(
      {
        link,
        isCreated: true
      },
      'linksUpdated'
    );
    return link;
  }

  addNode(node: NodeModel): NodeModel {
    this.getActiveNodeLayer().addModel(node);
    this.fireEvent({node, isCreated: true}, 'nodesUpdated');
    return node;
  }

  removeLink(link: LinkModel) {
    const removed = this.getLinkLayers().some((layer) => {
      return layer.removeModel(link);
    });
    if (removed) {
      this.fireEvent({link, isCreated: false}, 'linksUpdated');
    }
  }

  removeNode(node: NodeModel) {
    const removed = this.getNodeLayers().some((layer) => {
      return layer.removeModel(node);
    });
    if (removed) {
      this.fireEvent({node, isCreated: false}, 'nodesUpdated');
    }
  }

  getLinks(): LinkModel[] {
    return this.getLinkLayers().flatMap((layer) => {
      return Object.values(layer.getModels());
    });
  }

  getNodes(): NodeModel[] {
    return this.getNodeLayers().flatMap((layer) => {
      return Object.values(layer.getModels());
    });
  }
}
