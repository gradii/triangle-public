/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { boundingBoxFromPoints, Rectangle, Vector2 } from '@gradii/vector-math';
import { Subject } from 'rxjs';
import { BaseEntityEvent, DeserializeContext } from '../../../canvas-core/core-models/base-entity';
import { BaseModel, BaseModelGenerics, BaseModelListener, BaseModelOptions } from '../../../canvas-core/core-models/base-model';
import { ModelGeometryInterface } from '../../../canvas-core/core/model-geometry-interface';
import { DiagramModel } from '../../models/diagram-model';
import { LabelModel } from '../label/label-model';
import { PortModel } from '../port/port-model';
import { PointModel } from './point-model';

export interface LinkModelListener extends BaseModelListener {
  sourcePortChanged(event: BaseEntityEvent<LinkModel> & { port: null | PortModel }): void;

  targetPortChanged(event: BaseEntityEvent<LinkModel> & { port: null | PortModel }): void;
}

export interface LinkModelGenerics extends BaseModelGenerics {
  LISTENER: LinkModelListener;
  PARENT: DiagramModel;
}

export class LinkModel<G extends LinkModelGenerics = LinkModelGenerics> extends BaseModel<G>
  implements ModelGeometryInterface {
  protected _sourcePort: PortModel | null = null;
  protected _targetPort: PortModel | null = null;

  protected labels: LabelModel[] = [];
  protected points: PointModel[];

  // protected renderedPaths: SVGPathElement[] = [];


  public reportInitialPosition = new Subject();
  public portChanged = new Subject();
  public selectionChanged = new Subject();

  constructor(options: BaseModelOptions) {
    super(options);
    this.points = [
      new PointModel({
        link: this
      }),
      new PointModel({
        link: this
      })
    ];
  }

  getBoundingBox(): Rectangle {
    return boundingBoxFromPoints(
      this.points.map((point: PointModel) => {
        return point.getPosition();
      })
    );
  }

  getSelectionEntities(): BaseModel[] {
    if (this.getTargetPort() && this.getSourcePort()) {
      return super.getSelectionEntities().concat(this.points.slice(0, this.points.length));
    }
    // allow selection of the first point
    if (!this.getSourcePort()) {
      return super.getSelectionEntities().concat(this.points.slice(0, this.points.length - 1));
    }
    // allow selection of the last point
    if (!this.getTargetPort()) {
      return super.getSelectionEntities().concat(this.points.slice(1, this.points.length));
    }
    return super.getSelectionEntities().concat(this.points);
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.points = (data.points || []).map((point) => {
      const p = new PointModel({
        link    : this,
        position: new Vector2(point.x, point.y)
      });
      p.deserialize(point, context);
      return p;
    });
  }

  // getRenderedPath(): SVGPathElement[] {
  //   return this.renderedPaths;
  // }
  //
  // setRenderedPaths(paths: SVGPathElement[]) {
  //   this.renderedPaths = paths;
  // }

  serialize() {
    return {
      ...super.serialize(),
      source    : this._sourcePort ? this._sourcePort.getParent().getID() : null,
      sourcePort: this._sourcePort ? this._sourcePort.getID() : null,
      target    : this._targetPort ? this._targetPort.getParent().getID() : null,
      targetPort: this._targetPort ? this._targetPort.getID() : null,
      points    : this.points.map((point) => {
        return point.serialize();
      }),
      labels    : this.labels.map((label) => {
        return label.serialize();
      })
    };
  }

  doClone(lookupTable = {}, clone: any) {
    clone.setPoints(
      this.getPoints()
        .map((point: PointModel) => {
          return point.clone(lookupTable);
        })
    );
    if (this._sourcePort) {
      clone.setSourcePort(this._sourcePort.clone(lookupTable));
    }
    if (this._targetPort) {
      clone.setTargetPort(this._targetPort.clone(lookupTable));
    }
  }

  clearPort(port: PortModel) {
    if (this._sourcePort === port) {
      this.setSourcePort(null);
    } else if (this._targetPort === port) {
      this.setTargetPort(null);
    }
  }

  remove() {
    if (this._sourcePort) {
      this._sourcePort.removeLink(this);
    }
    if (this._targetPort) {
      this._targetPort.removeLink(this);
    }
    super.remove();
  }

  isLastPoint(point: PointModel) {
    const index = this.getPointIndex(point);
    return index === this.points.length - 1;
  }

  getPointIndex(point: PointModel) {
    return this.points.indexOf(point);
  }

  getPointModel(id: string): PointModel | null {
    for (let i = 0; i < this.points.length; i++) {
      if (this.points[i].getID() === id) {
        return this.points[i];
      }
    }
    return null;
  }

  getPortForPoint(point: PointModel): PortModel {
    if (this._sourcePort !== null && this.getFirstPoint().getID() === point.getID()) {
      return this._sourcePort;
    }
    if (this._targetPort !== null && this.getLastPoint().getID() === point.getID()) {
      return this._targetPort;
    }
    return null;
  }

  getPointForPort(port: PortModel): PointModel {
    if (this._sourcePort !== null && this._sourcePort.getID() === port.getID()) {
      return this.getFirstPoint();
    }
    if (this._targetPort !== null && this._targetPort.getID() === port.getID()) {
      return this.getLastPoint();
    }
    return null;
  }

  getFirstPoint(): PointModel {
    return this.points[0];
  }

  getLastPoint(): PointModel {
    return this.points[this.points.length - 1];
  }

  getSourcePort(): PortModel {
    return this._sourcePort;
  }

  getTargetPort(): PortModel {
    return this._targetPort;
  }

  setSourcePort(port: PortModel) {
    if (port.canSourcePortAcceptLink(this)) {
      port.addLink(this);
      if (this._sourcePort !== null) {
        this._sourcePort.removeLink(this);
      }
      this._sourcePort = port;
      this.innerPortChanged();

      this.reportInitialPosition.next({
        sourcePort: this._sourcePort,
        targetPort: this._targetPort,
        points: this.points,
        port,
      });
      this.fireEvent({port}, 'sourcePortChanged');
    }
  }

  setTargetPort(port: PortModel) {
    if (port.canTargetPortAcceptLink(this)) {
      port.addLink(this);

      if (this._targetPort !== null) {
        this._targetPort.removeLink(this);
      }
      this._targetPort = port;
      this.innerPortChanged();

      this.reportInitialPosition.next({
        sourcePort: this._sourcePort,
        targetPort: this._targetPort,
        points: this.points,
        port,
      });
      this.fireEvent({port}, 'targetPortChanged');
    }
  }

  point(x: number, y: number, index: number = 1): PointModel {
    return this.addPoint(this.generatePoint(x, y), index);
  }

  addLabel(label: LabelModel) {
    label.setParent(this);
    this.labels.push(label);
  }

  getPoints(): PointModel[] {
    return this.points;
  }

  getLabels() {
    return this.labels;
  }

  setPoints(points: PointModel[]) {
    points.forEach((point) => {
      point.setParent(this);
    });
    this.points = points;
    this.innerPortChanged();
  }

  removePoint(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel), 1);
    this.innerPortChanged();
  }

  removePointsBefore(pointModel: PointModel) {
    this.points.splice(0, this.getPointIndex(pointModel));
    this.innerPortChanged();
  }

  removePointsAfter(pointModel: PointModel) {
    this.points.splice(this.getPointIndex(pointModel) + 1);
    this.innerPortChanged();
  }

  removeMiddlePoints() {
    if (this.points.length > 2) {
      this.points.splice(0, this.points.length - 2);
      this.innerPortChanged();
    }
  }

  addPoint<P extends PointModel>(pointModel: P, index = 1): P {
    pointModel.setParent(this);
    this.points.splice(index, 0, pointModel);

    this.innerPortChanged();
    return pointModel;
  }

  generatePoint(x: number = 0, y: number = 0): PointModel {
    return new PointModel({
      link    : this,
      position: new Vector2(x, y)
    });
  }

  innerPortChanged() {
    this.portChanged.next({
      sourcePort: this._sourcePort,
      targetPort: this._targetPort,
      points: this.points,
    })
  }
}
