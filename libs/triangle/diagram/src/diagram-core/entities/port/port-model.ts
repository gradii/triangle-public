/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Rectangle, Vector2 } from '@gradii/vector-math';
import { BaseEntityEvent, DeserializeContext } from '../../../canvas-core/core-models/base-entity';
import { BaseModelOptions } from '../../../canvas-core/core-models/base-model';
import {
  BasePositionModel, BasePositionModelGenerics, BasePositionModelListener
} from '../../../canvas-core/core-models/base-position-model';
import { LinkModel } from '../link/link-model';
import { NodeModel } from '../node/node-model';

export const enum PortModelAlignment {
  TOP    = 'top',
  LEFT   = 'left',
  BOTTOM = 'bottom',
  RIGHT  = 'right'
}

export const enum PortModelAnchor {
  topLeft      = 'topLeft',
  topCenter    = 'topCenter',
  topRight     = 'topRight',
  leftCenter   = 'leftCenter',
  center       = 'center',
  rightCenter  = 'rightCenter',
  bottomLeft   = 'bottomLeft',
  bottomCenter = 'bottomCenter',
  bottomRight  = 'bottomRight',
}

export interface PortModelListener extends BasePositionModelListener {
  /**
   * fires when it first receives positional information
   */
  reportInitialPosition?: (event: BaseEntityEvent<PortModel>) => void;
}

export interface PortModelOptions extends BaseModelOptions {
  alignment?: PortModelAlignment;
  maximumLinks?: number;
  maxSourceLinks?: number;
  maxTargetLinks?: number;
  sourceLinkable?: boolean;
  targetLinkable?: boolean;
  anchorOffsetX?: number;
  anchorOffsetY?: number;
  linkablePredicate?: (sourcePort: PortModel, targetPort: PortModel, link: LinkModel) => boolean;
  name: string;
  anchor?: PortModelAnchor;
  data?: any;
}

export interface PortModelGenerics extends BasePositionModelGenerics {
  OPTIONS: PortModelOptions;
  PARENT: NodeModel;
  LISTENER: PortModelListener;
}

export class PortModel<G extends PortModelGenerics = PortModelGenerics> extends BasePositionModel<G> {

  links: LinkModel[];

  // calculated post rendering so routing can be done correctly
  width: number;
  height: number;
  reportedPosition: boolean;

  anchor: PortModelAnchor;

  anchorOffsetX: number = 0;
  anchorOffsetY: number = 0;

  // region options
  alignment: PortModelAlignment;

  /**
   * @deprecated use maxSourceLinks maxTargetLinks instead
   */
  maximumLinks: number   = 1;
  maxSourceLinks: number = 0;
  maxTargetLinks: number = 0;
  sourceLinkable: boolean;
  targetLinkable: boolean;

  linkablePredicate: (sourcePort: PortModel, targetPort: PortModel, link: LinkModel) => boolean;

  name: string;

  data: any;

  // endregion

  constructor(options: G['OPTIONS']) {
    super(options);
    this.links            = [];
    this.reportedPosition = false;
    this.alignment        = options.alignment;

    this.maximumLinks      = options.maximumLinks;
    this.maxSourceLinks    = options.maxSourceLinks;
    this.maxTargetLinks    = options.maxTargetLinks;
    this.sourceLinkable    = options.sourceLinkable ?? true;
    this.targetLinkable    = options.targetLinkable ?? true;
    this.linkablePredicate = options.linkablePredicate;

    this.name          = options.name;
    this.data          = options.data;
    this.anchor        = options.anchor;
    this.anchorOffsetX = options.anchorOffsetX || 0;
    this.anchorOffsetY = options.anchorOffsetY || 0;

  }

  deserialize(data: ReturnType<this['serialize']>, context: DeserializeContext<this>) {
    super.deserialize(data, context);
    this.reportedPosition = false;

    this.name              = data.name;
    this.alignment         = data.alignment;
    this.maximumLinks      = data.maximumLinks;
    this.maxSourceLinks    = data.maxSourceLinks;
    this.maxTargetLinks    = data.maxTargetLinks;
    this.sourceLinkable    = data.sourceLinkable;
    this.targetLinkable    = data.targetLinkable;
    this.linkablePredicate = data.linkablePredicate;
    this.anchor            = data.anchor;
    this.anchorOffsetX     = data.anchorOffsetX;
    this.anchorOffsetY     = data.anchorOffsetY;
  }

  serialize() {
    return {
      ...super.serialize(),
      name             : this.name,
      alignment        : this.alignment,
      maximumLinks     : this.maximumLinks,
      maxSourceLinks   : this.maxSourceLinks,
      maxTargetLinks   : this.maxTargetLinks,
      sourceLinkable   : this.sourceLinkable,
      targetLinkable   : this.targetLinkable,
      linkablePredicate: this.linkablePredicate,
      anchor           : this.anchor,
      anchorOffsetX    : this.anchorOffsetX,
      anchorOffsetY    : this.anchorOffsetY,
      parentNode       : this.parent.getID(),
      links            : this.links.map((link) => {
        return link.getID();
      })
    };
  }

  setPosition(point: Vector2): void;
  setPosition(x: number, y: number): void;
  setPosition(x: Vector2 | number, y?: number) {
    if (x instanceof Vector2) {
      y = x.y;
      x = x.x;
    }
    super.setPosition(x, y);

    this._positionLink();
  }

  doClone(lookupTable = {}, clone: any) {
    clone.links      = [];
    clone.parentNode = this.getParent().clone(lookupTable);
  }

  getNode(): NodeModel {
    return this.getParent();
  }

  getName(): string {
    return this.name;
  }

  getMaximumLinks(): number {
    return this.maximumLinks;
  }

  setMaximumLinks(maximumLinks: number) {
    this.maximumLinks = maximumLinks;
  }

  canSourcePortAcceptLink(link: LinkModel) {
    if (!this.sourceLinkable) {
      return false;
    }
    const linkTargetPort = link.getTargetPort();

    // disable duplicate link
    if (linkTargetPort && (
      this.links.find(it => it.getTargetPort() === linkTargetPort) ||
      linkTargetPort.parent === this.parent ||
      linkTargetPort === this
    )) {
      return false;
    }
    if (this.maxSourceLinks > 0 && this.getLinks().filter((l) => l.getSourcePort() === this).length >= this.maxSourceLinks) {
      return false;
    }
    if (this.linkablePredicate) {
      return this.linkablePredicate(this, linkTargetPort, link);
    }
    return true;
  }

  canTargetPortAcceptLink(link: LinkModel) {
    if (!this.targetLinkable) {
      return false;
    }
    const linkSourcePort = link.getSourcePort();

    // disable duplicate link
    if (linkSourcePort && (
      this.links.find(it => it.getSourcePort() === linkSourcePort) ||
      linkSourcePort.parent === this.parent ||
      linkSourcePort === this
    )) {
      return false;
    }
    // disable max link
    if (this.maxTargetLinks > 0 && this.getLinks().filter((l) => l.getTargetPort() === this).length >= this.maxTargetLinks) {
      return false;
    }
    if (this.linkablePredicate) {
      return this.linkablePredicate(linkSourcePort, this, link);
    }
    return true;
  }

  removeLink(link: LinkModel) {
    this.links.splice(this.links.findIndex(it => it.getID() === link.getID()), 1);
  }

  addLink(link: LinkModel) {
    this.links.push(link);
  }

  findLink(id: string) {
    return this.links.find((link) => link.getID() === id);
  }

  getLinks() {
    return this.links;
  }

  createLinkModel(): LinkModel | null {
    // const numberOfLinks: number = this.links.length;
    // if (this.maximumLinks === 1 && numberOfLinks >= 1) {
    //   return Array.from(this.links.values())[0];
    // } else if (numberOfLinks >= this.maximumLinks) {
    //   return null;
    // }
    // return null;
    return null;
  }

  _positionLink() {
    this.getLinks().forEach((link) => {
      link.getPointForPort(this).setPosition(this.getAnchor());

      link.innerPortChanged();
    });
  }

  reportPosition() {
    this._positionLink();
    this.fireEvent(
      {
        entity: this
      },
      'reportInitialPosition'
    );
  }

  getAnchor() {
    if (this.anchor) {
      const x      = this.getX();
      const y      = this.getY();
      const width  = this.width;
      const height = this.height;
      switch (this.anchor) {
        case PortModelAnchor.topLeft:
          return new Vector2(x, y).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.topCenter:
          return new Vector2(x + width / 2, y).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.topRight:
          return new Vector2(x + width, y).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.leftCenter:
          return new Vector2(x, y + height / 2).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.center:
          return new Vector2(x + width / 2, y + height / 2).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.rightCenter:
          return new Vector2(x + width, y + height / 2).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.bottomLeft:
          return new Vector2(x, y + height).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.bottomCenter:
          return new Vector2(x + width / 2, y + height).addXY(this.anchorOffsetX, this.anchorOffsetY);
        case PortModelAnchor.bottomRight:
          return new Vector2(x + width, y + height).addXY(this.anchorOffsetX, this.anchorOffsetY);
      }
    } else {
      return this.getCenter();
    }
  }

  getCenter(): Vector2 {
    return new Vector2(this.getX() + this.width / 2, this.getY() + this.height / 2);
  }

  updateCoords(coords: Rectangle) {
    this.width  = coords.getWidth();
    this.height = coords.getHeight();
    this.setPosition(coords.getTopLeft());
    this.reportedPosition = true;
    this.reportPosition();
  }

  /**
   * @deprecated use canAddSourceLink, canAddTargetLink instead
   * @param port
   */
  canLinkToPort(port: PortModel): boolean {

    return true;
  }

  isLocked() {
    return super.isLocked() || this.getParent().isLocked();
  }
}
