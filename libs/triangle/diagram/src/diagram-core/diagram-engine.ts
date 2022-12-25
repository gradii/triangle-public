/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { boundingBoxFromPolygons, Rectangle, Vector2 } from '@gradii/vector-math';
import {
  CanvasEngine, CanvasEngineListener, CanvasEngineOptions
} from '../canvas-core/canvas-engine';
import { BaseModel } from '../canvas-core/core-models/base-model';
import { Toolkit } from '../canvas-core/toolkit';
import { NodeModel } from './entities/node/node-model';
import { PortModel } from './entities/port/port-model';
import { DiagramModel } from './models/diagram-model';


export class DiagramEngine extends CanvasEngine<CanvasEngineListener> {
  maxNumberPointsPerLink: number;
  protected model: DiagramModel;

  public renderedPorts: Set<PortModel> = new Set();

  constructor(options: CanvasEngineOptions = {}) {
    super(options);
    this.maxNumberPointsPerLink = 1000;
  }

  /**
   * Gets a model and element under the mouse cursor
   */
  getMouseElement(event: MouseEvent): BaseModel {
    const target       = event.target as Element;
    const diagramModel = this.model;

    // is it a port
    let element = Toolkit.closest(target, '.port[data-name]');
    if (element) {
      const nodeElement = Toolkit.closest(target, '.node[data-nodeid]') as HTMLElement;
      return diagramModel.getNode(nodeElement.getAttribute('data-nodeid')).getPort(
        element.getAttribute('data-name'));
    }

    // look for a point
    element = Toolkit.closest(target, '.point[data-id]');
    if (element) {
      return diagramModel.getLink(element.getAttribute('data-linkid'))
        .getPointModel(element.getAttribute('data-id'));
    }

    // look for a link
    element = Toolkit.closest(target, '[data-linkid]');
    if (element) {
      return diagramModel.getLink(element.getAttribute('data-linkid'));
    }

    // look for a node
    element = Toolkit.closest(target, '.node[data-nodeid]');
    if (element) {
      return diagramModel.getNode(element.getAttribute('data-nodeid'));
    }

    return null;
  }

  getNodeElement(node: NodeModel): Element {
    const selector = this.canvas.querySelector(`.node[data-nodeid="${node.getID()}"]`);
    if (selector === null) {
      throw new Error('Cannot find Node element with nodeID: [' + node.getID() + ']');
    }
    return selector;
  }

  getNodePortElement(port: PortModel): any {
    const selector = this.canvas.querySelector(
      `.port[data-name="${port.getName()}"][data-nodeid="${port.getParent().getID()}"]`
    );
    if (selector === null) {
      throw new Error(
        'Cannot find Node Port element with nodeID: [' +
        port.getParent().getID() +
        '] and name: [' +
        port.getName() +
        ']'
      );
    }
    return selector;
  }

  getPortCenter(port: PortModel): Vector2 {
    return this.getPortCoords(port).getCenter();
  }

  /**
   * Calculate rectangular coordinates of the port passed in.
   */
  getPortCoords(port: PortModel, element?: HTMLDivElement): Rectangle {
    if (!this.canvas) {
      throw new Error('Canvas needs to be set first');
    }
    if (!element) {
      element = this.getNodePortElement(port);
    }
    const sourceRect = element.getBoundingClientRect();
    const point      = this.getRelativePointFromClientRect({
      clientX: sourceRect.left,
      clientY: sourceRect.top
    });
    const zoom       = this.model.getZoomLevel() / 100.0;
    return Rectangle.createFromBounds(point.x, point.y, sourceRect.width / zoom,
      sourceRect.height / zoom);
  }

  /**
   * Determine the width and height of the node passed in.
   * It currently assumes nodes have a rectangular shape, can be overriden for customised shapes.
   */
  getNodeDimensions(node: NodeModel): { width: number; height: number } {
    if (!this.canvas) {
      return {
        width : 0,
        height: 0
      };
    }

    const nodeElement = this.getNodeElement(node);
    const nodeRect    = nodeElement.getBoundingClientRect();

    return {
      width : nodeRect.width,
      height: nodeRect.height
    };
  }

  /**
   * Get nodes bounding box coordinates with or without margin
   * @returns rectangle points in node layer coordinates
   */
  getBoundingNodesRect(nodes: NodeModel[], margin?: number): Rectangle {
    if (nodes && nodes.length) {
      const boundingBox = boundingBoxFromPolygons(nodes.map((node) => node.getBoundingBox()));
      if (margin) {
        return Rectangle.createFromBounds(
          boundingBox.getTopLeft().x - margin,
          boundingBox.getTopLeft().y - margin,
          boundingBox.getWidth() + 2 * margin,
          boundingBox.getHeight() + 2 * margin
        );
      }
      return boundingBox;
    }

    return Rectangle.createFromBounds(0, 0, 0, 0);
  }

  zoomToFitNodes(margin?: number) {
    let nodesRect; // nodes bounding rectangle
    const selectedNodes = this.model
      .getSelectedEntities()
      .filter((entity) => entity instanceof NodeModel)
      .map((node) => node) as NodeModel[];

    // no node selected
    if (selectedNodes.length == 0) {
      const allNodes = this.model
        .getSelectionEntities()
        .filter((entity) => entity instanceof NodeModel)
        .map((node) => node) as NodeModel[];

      // get nodes bounding box with margin
      nodesRect = this.getBoundingNodesRect(allNodes, margin);
    } else {
      // get nodes bounding box with margin
      nodesRect = this.getBoundingNodesRect(selectedNodes, margin);
    }

    if (nodesRect) {
      // there is something we should zoom on
      const canvasRect            = this.canvas.getBoundingClientRect();
      const canvasTopLeftPoint    = {
        x: canvasRect.left,
        y: canvasRect.top
      };
      const nodeLayerTopLeftPoint = {
        x: canvasTopLeftPoint.x + this.getModel().getOffsetX(),
        y: canvasTopLeftPoint.y + this.getModel().getOffsetY()
      };

      const xFactor    = this.canvas.clientWidth / nodesRect.getWidth();
      const yFactor    = this.canvas.clientHeight / nodesRect.getHeight();
      const zoomFactor = xFactor < yFactor ? xFactor : yFactor;

      this.model.setZoomLevel(zoomFactor * 100);

      const nodesRectTopLeftPoint = {
        x: nodeLayerTopLeftPoint.x + nodesRect.getTopLeft().x * zoomFactor,
        y: nodeLayerTopLeftPoint.y + nodesRect.getTopLeft().y * zoomFactor
      };

      this.model.setOffset(
        this.model.getOffsetX() + canvasTopLeftPoint.x - nodesRectTopLeftPoint.x,
        this.model.getOffsetY() + canvasTopLeftPoint.y - nodesRectTopLeftPoint.y
      );
      this.repaintCanvas();
    }
  }

  getMaxNumberPointsPerLink(): number {
    return this.maxNumberPointsPerLink;
  }

  setMaxNumberPointsPerLink(max: number) {
    this.maxNumberPointsPerLink = max;
  }
}
