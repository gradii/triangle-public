/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Inject, Injectable, Optional } from '@angular/core';
import { Vector2 } from '@gradii/vector-math';
import { Action, ActionEvent, InputType } from '../../canvas-core/core-actions/action';
import {
  AbstractDisplacementState, AbstractDisplacementStateEvent
} from '../../canvas-core/core-state/abstract-displacement-state';
import { DiagramEngine } from '../diagram-engine';
import { LinkModel } from '../entities/link/link-model';
import { PortModel } from '../entities/port/port-model';
import { DiagramModel } from '../models/diagram-model';

export interface DragNewLinkStateOptions {
  /**
   * If enabled, the links will stay on the canvas if they dont connect to a port
   * when dragging finishes
   */
  allowLooseLinks?: boolean;
  /**
   * If enabled, then a link can still be drawn from the port even if it is locked
   */
  allowLinksFromLockedPorts?: boolean;
}

// todo refactor use injectable to instant state
@Injectable()
export class DragNewLinkState extends AbstractDisplacementState<DiagramEngine> {
  private port: PortModel;
  config: DragNewLinkStateOptions;
  private link: LinkModel;
  private currentLinkSourceToTarget: boolean;
  private snapToItem: { distance: number, port: PortModel, anchor: Vector2 };

  cachedPortsAnchor: { anchor: Vector2, port: PortModel }[] = [];

  constructor(
    @Optional() @Inject('DragNewLinkStateOptions')
      options: DragNewLinkStateOptions = {}
  ) {
    super({name: 'drag-new-link'});

    this.config = {
      allowLooseLinks          : false,
      allowLinksFromLockedPorts: false,
      ...options
    };

    this.registerAction(
      new Action({
        type: InputType.MOUSE_DOWN,
        fire: (event: ActionEvent<MouseEvent, PortModel>) => {
          this.port = this.engine.getMouseElement(event.event) as PortModel;
          if (!this.config.allowLinksFromLockedPorts && this.port.isLocked()) {
            this.eject();
            return;
          }
          this.link = this.port.createLinkModel();

          // if no link is given, just eject the state
          if (!this.link) {
            this.eject();
            return;
          }
          // this.link.setSelected(true);
          if (this.port.canSourcePortAcceptLink(this.link)) {
            this.link.setSourcePort(this.port);
            this.currentLinkSourceToTarget = true;
          } else if (this.port.canTargetPortAcceptLink(this.link)) {
            this.link.setTargetPort(this.port);
            this.currentLinkSourceToTarget = false;
          } else {
            this.eject();
            return;
          }
          (this.engine.getModel() as DiagramModel).addLink(this.link);
          this.port.reportPosition();

          this.cachedPortsAnchor = [];
          this.engine.renderedPorts.forEach(it => {
            const anchor = it.getAnchor();
            this.cachedPortsAnchor.push({
              port: it, anchor
            });
          });
        }
      })
    );

    this.registerAction(
      new Action({
        type: InputType.MOUSE_UP,
        fire: (event: ActionEvent<MouseEvent>) => {
          let model: PortModel;
          if (this.snapToItem) {
            model = this.snapToItem.port;
          } else {
            const m = this.engine.getMouseElement(event.event);
            if (m instanceof PortModel) {
              model = m;
            }
          }
          // check to see if we connected to a new port
          if (model) {
            if (!this.link.getTargetPort() && model.canTargetPortAcceptLink(this.link)) {
              this.link.setTargetPort(model);
            } else if (!this.link.getSourcePort() && model.canSourcePortAcceptLink(this.link)) {
              this.link.setSourcePort(model);
            } else {
              this.link.remove();
              this.engine.repaintCanvas();
              this.dispose();
              return;
            }
            model.reportPosition();
            this.engine.repaintCanvas();
            this.dispose();
            return;
          }

          if (!this.config.allowLooseLinks) {
            this.link.remove();
            this.engine.repaintCanvas();
            this.dispose();
          }
        }
      })
    );
  }

  dispose() {
    this.link = null;
    this.snapToItem = null;
    this.currentLinkSourceToTarget = null;
    this.cachedPortsAnchor = [];
  }

  /**
   * Calculates the link's far-end point position on mouse move.
   * In order to be as precise as possible the mouse initialXRelative & initialYRelative are taken into account as well
   * as the possible engine offset
   */
  fireMouseMoved(event: AbstractDisplacementStateEvent): any {
    const portPos             = this.port.getPosition();
    const zoomLevelPercentage = this.engine.getModel().getZoomLevel() / 100;
    const engineOffsetX       = this.engine.getModel().getOffsetX() / zoomLevelPercentage;
    const engineOffsetY       = this.engine.getModel().getOffsetY() / zoomLevelPercentage;
    const initialXRelative    = this.initialXRelative / zoomLevelPercentage;
    const initialYRelative    = this.initialYRelative / zoomLevelPercentage;
    const linkNextX           = portPos.x - engineOffsetX + (initialXRelative - portPos.x) + event.virtualDisplacementX;
    const linkNextY           = portPos.y - engineOffsetY + (initialYRelative - portPos.y) + event.virtualDisplacementY;

    const list: { distance: number, port: PortModel, anchor: Vector2 }[] = this.cachedPortsAnchor
      .map(it => {
        const distance = it.anchor.distanceTo(new Vector2(linkNextX, linkNextY));
        return {
          distance,
          port  : it.port,
          anchor: it.anchor
        };
      })
      .filter(it => it.distance < 40)
      .sort((a, b) => a.distance - b.distance);

    this.snapToItem = null;
    if (this.currentLinkSourceToTarget) {
      if (list.length) {
        const item = list.find(it => it.port.canTargetPortAcceptLink(this.link));
        if (item) {
          this.snapToItem = item;
        }
      }

      if (this.snapToItem) {
        this.link.getLastPoint().setPosition(this.snapToItem.anchor.x, this.snapToItem.anchor.y);
      } else {
        this.link.getLastPoint().setPosition(linkNextX, linkNextY);
      }
    } else {
      if (list.length) {
        const item = list.find(it => it.port.canSourcePortAcceptLink(this.link));
        if (item) {
          this.snapToItem = item;
        }
      }

      if (this.snapToItem) {
        this.link.getFirstPoint().setPosition(this.snapToItem.anchor.x, this.snapToItem.anchor.y);
      } else {
        this.link.getFirstPoint().setPosition(linkNextX, linkNextY);
      }

    }
    this.link.innerPortChanged();
    this.engine.repaintCanvas();
  }
}
