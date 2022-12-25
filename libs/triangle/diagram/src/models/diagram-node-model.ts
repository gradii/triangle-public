/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isObject } from '@gradii/nanofn';
import { DeserializeContext } from '../canvas-core/core-models/base-entity';
import { BasePositionModelOptions } from '../canvas-core/core-models/base-position-model';
import { NodeModel, NodeModelGenerics } from '../diagram-core/entities/node/node-model';
import { PortModelAlignment, PortModelAnchor } from '../diagram-core/entities/port/port-model';
import { toUniqueType } from '../utils';
import { DefaultPortModelOptions, DiagramPortModel } from './diagram-port-model';


export type NodePortParam = Partial<Omit<DefaultPortModelOptions, 'name' | 'in'>>;

export interface DefaultNodeModelOptions extends Omit<BasePositionModelOptions, 'type'> {
  name?: string;
  namespace?: string;
  displayName?: string;
  color?: string;
}

export interface DefaultNodeModelGenerics extends NodeModelGenerics {
  OPTIONS: DefaultNodeModelOptions;
}

export class DiagramNodeModel extends NodeModel<DefaultNodeModelGenerics> {
  protected portsIn: DiagramPortModel[];
  protected portsOut: DiagramPortModel[];

  name: string;
  type: string;
  displayName: string;
  color: string;
  description: string;

  /**
   *
   * @deprecated
   */
  protected options: DefaultNodeModelOptions;

  constructor(name: string, displayName: string);
  constructor(name: string, displayName: string, color: string);
  constructor(name: string, displayName: string, namespace: string, color: string);
  constructor(options?: DefaultNodeModelOptions);
  constructor(options: any = {}, displayName?: string, namespace?: string, color?: string) {
    if (arguments.length === 2) {
      options = {
        name       : options,
        displayName: displayName
      };
    } else if (arguments.length === 3) {
      options = {
        name       : options,
        displayName: displayName,
        color      : namespace
      };
    } else if (arguments.length === 4) {
      options = {
        name       : options,
        displayName: displayName,
        namespace  : namespace,
        color      : color
      };
    } else if (arguments.length === 1 && typeof options === 'string') {
      options = {
        name       : options,
        displayName: options
      };
    }
    options = {
      ...options,
      name       : options.name || 'default',
      displayName: options.displayName || options.name,
      type  : options.type || 'default/node',
      description: options.description || '',
      color      : options.color || 'rgb(0,192,255)',
    };
    super(options);

    this.type = options.type;

    this.name        = options.name;
    this.displayName = options.displayName;
    this.description = options.description;

    this.color = options.color;

    this.portsOut = [];
    this.portsIn  = [];
  }

  doClone(lookupTable: any, clone: any): void {
    clone.portsIn  = [];
    clone.portsOut = [];
    super.doClone(lookupTable, clone);
  }

  removePort(port: DiagramPortModel): void {
    super.removePort(port);
    if (port.in) {
      this.portsIn.splice(this.portsIn.indexOf(port), 1);
    } else {
      this.portsOut.splice(this.portsOut.indexOf(port), 1);
    }
    this.fireEvent({port, type: port.in ? 'in' : 'out', isCreate: false}, 'portsUpdated');
  }

  getPort(name: string): DiagramPortModel {
    return this.ports[name] as DiagramPortModel;
  }

  existPort<T extends DiagramPortModel>(port: T): boolean {
    return port.getName() in this.ports;
  }

  addPort<T extends DiagramPortModel>(port: T): T {
    super.addPort(port);
    if (port.in) {
      if (this.portsIn.indexOf(port) === -1) {
        this.portsIn.push(port);
      }
    } else {
      if (this.portsOut.indexOf(port) === -1) {
        this.portsOut.push(port);
      }
    }
    return port;
  }

  addInPort(name: string, options: NodePortParam): DiagramPortModel
  addInPort(name: string): DiagramPortModel
  addInPort(name: string, displayName?: string, type?: string, after?: boolean, options?: NodePortParam): DiagramPortModel
  addInPort(name: string, displayName: string | NodePortParam = name,
            type?: string,
            after                                             = true,
            options: NodePortParam                            = {}): DiagramPortModel {
    if (isObject(displayName)) {
      options     = displayName as Record<string, any>;
      displayName = options['displayName'] || name;
      type        = options['type'];
      after       = options['after'] || true;
    }
    let p: DiagramPortModel = this.getPort(name) as DiagramPortModel;
    if (p) {
      return p;
    }
    p = new DiagramPortModel({
      in            : true,
      name          : name,
      displayName   : displayName as string,
      alignment     : PortModelAlignment.LEFT,
      anchor        : PortModelAnchor.leftCenter,
      sourceLinkable: false,
      targetLinkable: true,
      anchorOffsetX : -5,
      ...options
    });
    if (!after) {
      this.portsIn.splice(0, 0, p);
    }
    this.fireEvent({port: p, type: 'in', isCreate: true}, 'portsUpdated');
    return this.addPort(p);
  }

  addOutPort(name: string, options: NodePortParam): DiagramPortModel
  addOutPort(name: string): DiagramPortModel
  addOutPort(name: string, displayName?: string, type?: string, after?: boolean, options?: NodePortParam): DiagramPortModel
  addOutPort(name: string, displayName: string | NodePortParam = name,
             type?: string,
             after                                             = true,
             options: NodePortParam                            = {}
  ): DiagramPortModel {
    if (isObject(displayName)) {
      options     = displayName;
      displayName = options['displayName'] || name;
      type        = options['type'];
      after       = options['after'] || true;
    }
    let p: DiagramPortModel = this.getPort(name) as DiagramPortModel;
    if (p) {
      return p;
    }
    p = new DiagramPortModel({
      in            : false,
      name          : name,
      type,
      displayName   : displayName as string,
      alignment     : PortModelAlignment.RIGHT,
      anchor        : PortModelAnchor.rightCenter,
      sourceLinkable: true,
      targetLinkable: false,
      anchorOffsetX : 5,
      ...options
    });
    if (!after) {
      this.portsOut.splice(0, 0, p);
    }
    this.fireEvent({port: p, type: 'out', isCreate: true}, 'portsUpdated');
    return this.addPort(p);
  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);

    // deserialize ports
    data.ports.forEach((port: any) => {
      const portOb = new DiagramPortModel(port.in);
      portOb.deserialize(port, context);
      // the links need these
      context.registerModel(portOb);
      this.addPort(portOb);
    });
    this.name        = data.name;
    this.displayName = data.displayName;
    // rebuild type
    this.type        = data.type;
    this.color       = data.color;
    this.portsIn     = data.portsInOrder.map((id: string) => {
      return this.getPortFromID(id);
    }) as DiagramPortModel[];
    this.portsOut    = data.portsOutOrder.map((id: string) => {
      return this.getPortFromID(id);
    }) as DiagramPortModel[];
  }

  override serialize(): any {
    return {
      ...super.serialize(),
      name         : this.name,
      displayName  : this.displayName,
      type    : this.type,
      color        : this.color,
      portsInOrder : this.portsIn.map((port) => {
        return port.getID() as string;
      }),
      portsOutOrder: this.portsOut.map((port) => {
        return port.getID() as string;
      })
    };
  }

  getInPorts(): DiagramPortModel[] {
    return this.portsIn;
  }

  getOutPorts(): DiagramPortModel[] {
    return this.portsOut;
  }
}
