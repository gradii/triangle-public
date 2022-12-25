/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Rectangle, Vector2 } from '@gradii/vector-math';
import { BaseEntityEvent, DeserializeContext } from '../../../canvas-core/core-models/base-entity';
import { BaseModelListener } from '../../../canvas-core/core-models/base-model';
import {
  BasePositionModel, BasePositionModelGenerics
} from '../../../canvas-core/core-models/base-position-model';
import { DiagramModel } from '../../models/diagram-model';
import { LinkModel } from '../link/link-model';
import { PortModel } from '../port/port-model';

export interface NodeModelListener extends BaseModelListener {
  positionChanged?(event: BaseEntityEvent<NodeModel>): void;
}

export interface NodeModelGenerics extends BasePositionModelGenerics {
  LISTENER: NodeModelListener;
  PARENT: DiagramModel;
}

export class NodeModel<G extends NodeModelGenerics = NodeModelGenerics> extends BasePositionModel<G> {
  // calculated post rendering so routing can be done correctly
  width: number;
  height: number;

  /**
   * @deprecated
   * @protected
   */
  protected ports: { [s: string]: PortModel };

  data?: any;

  constructor(options: G['OPTIONS']) {
    super(options);
    this.ports  = {};
    this.data = options.data;
    this.width  = 0;
    this.height = 0;
  }

  getBoundingBox(): Rectangle {
    const p = this.getPosition();
    return Rectangle.createFromBounds(p.x, p.y, this.width, this.height);
  }

  setPosition(point: Vector2): void;
  setPosition(x: number, y: number): void;
  setPosition(x: number | Vector2, y?: number) {
    const old = this.position;
    super.setPosition(x as number, y);

    // also update the port co-ordinates (for make glorious speed)
    Object.values(this.ports).forEach((port) => {
      port.setPosition(
        port.getX() + this.position.x - old.x,
        port.getY() + this.position.y - old.y
      );
    });
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
  }

  serialize() {
    return {
      ...super.serialize(),
      ports: Object.values(this.ports).map((port: PortModel) => {
        return port.serialize();
      })
    };
  }

  doClone(lookupTable = {}, clone: any) {
    // also clone the ports
    clone.ports = {};
    Object.values(this.ports).forEach((port) => {
      clone.addPort(port.clone(lookupTable));
    });
  }

  remove() {
    super.remove();
    Object.values(this.ports).forEach((port) => {
      port.getLinks().forEach( (link) => {
        // @ts-ignore
        link.remove();
      });
    });
  }

  getPortFromID(id: string): PortModel | null {
    for (const i in this.ports) {
      if (this.ports[i].getID() === id) {
        return this.ports[i];
      }
    }
    return null;
  }

  getLink(id: string): LinkModel {
    for (const portID in this.ports) {
      const port = this.ports[portID];
      const link = port.findLink(id);
      if (link) {
        return link;
      }
    }
    return undefined;
  }

  getPort(name: string): PortModel | null {
    return this.ports[name];
  }

  getPorts(): { [s: string]: PortModel } {
    return this.ports;
  }

  removePort(port: PortModel) {
    // clear the port from the links
    for (const link of port.getLinks()) {
      // @ts-ignore
      link.clearPort(port);
    }
    // clear the parent node reference
    if (this.ports[port.getName()]) {
      this.ports[port.getName()].setParent(null);
      delete this.ports[port.getName()];
    }
  }

  addPort(port: PortModel): PortModel {
    port.setParent(this);
    this.ports[port.getName()] = port;
    return port;
  }

  updateDimensions({width, height}: { width: number; height: number }) {
    this.width  = width;
    this.height = height;
  }
}
