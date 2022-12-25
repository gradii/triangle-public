/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { DeserializeContext } from '../canvas-core/core-models/base-entity';
// import { AbstractModelFactory } from '../../canvas-core/core/abstract-model-factory';
import { LinkModel } from '../diagram-core/entities/link/link-model';
import { PortModel, PortModelAlignment, PortModelGenerics, PortModelOptions } from '../diagram-core/entities/port/port-model';
import { DiagramLinkModel } from './diagram-link-model';

export interface DefaultPortModelOptions extends PortModelOptions {
  name: string;
  displayName?: string;
  linkType?: string;
  in?: boolean;
  icon?: string;
}

export interface DefaultPortModelGenerics extends PortModelGenerics {
  OPTIONS: DefaultPortModelOptions;
}

export class DiagramPortModel extends PortModel<DefaultPortModelGenerics> {
  name: string;
  displayName: string;
  type: string;
  linkType: string;
  in: boolean;
  icon: string;

  order: number = 0;

  linkModelFactory: () => DiagramLinkModel;


  /**
   * @deprecated remove options use property instead
   */
  protected options: DefaultPortModelOptions;

  constructor(isIn: boolean);
  constructor(isIn: boolean, name: string);
  constructor(isIn: boolean, name: string, displayName: string);
  constructor(isIn: boolean, name: string, displayName: string, type: string);
  constructor(options: DefaultPortModelOptions);
  constructor(options: any, name?: string,
              displayName?: string, type?: string) {
    if (arguments.length === 2) {
      options = {
        in         : !!options,
        name       : name,
        displayName: name,
      };
    } else if (arguments.length === 3) {
      options = {
        in         : !!options,
        name       : name,
        displayName: displayName,
      };
    } else if (arguments.length === 4) {
      options = {
        in         : !!options,
        name       : name,
        displayName: displayName,
        type       : type,
      };
    } else if (arguments.length === 1 && typeof options === 'boolean') {
      options = {
        in: options,
      };
    }
    options = {
      ...options,
      name       : options.name,
      displayName: options.displayName ?? options.name,
      type       : type || 'diagram_port',
      alignment  : options.in ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT,
    };
    super(options);

    this.type     = options.type;
    this.linkType = options.linkType || 'diagram_link';

    this.name        = options.name;
    this.displayName = options.displayName;
    this.in          = options.in;
    this.icon        = options.icon;
  }


  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.type        = data.type;
    this.linkType    = data.linkType;
    this.in          = data.in;
    this.name        = data.name;
    this.displayName = data.displayName;
  }

  serialize() {
    return {
      ...super.serialize(),
      type       : this.type,
      linkType   : this.linkType,
      in         : this.in,
      name       : this.name,
      displayName: this.displayName
    };
  }

  link<T extends LinkModel>(port: PortModel): T {
    const link = this.createLinkModel();
    // if(this.sourceLinkable) {
    // }
    link.setSourcePort(this);
    link.setTargetPort(port);
    return link as T;
  }

  /**
   * @deprecated use port canAcceptLink
   * @param port
   */
  canLinkToPort(port: PortModel): boolean {
    if (port instanceof DiagramPortModel) {
      if (this.in === port.in) {
        return false;
      }
    }
    for (const link of this.links) {
      if (link.getTargetPort() === port) {
        return false;
      }
    }
    return true;
  }

  createLinkModel(/*factory?: AbstractModelFactory<LinkModel>*/): LinkModel {
    if (this.linkModelFactory) {
      return this.linkModelFactory();

    }

    const result = super.createLinkModel();
    // result.type = 'default/link:default';
    if (!result) {
      return new DiagramLinkModel({
        type: this.linkType || 'diagram_link'
      });
    }
    return result;
  }
}
