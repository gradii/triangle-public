/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CdkPortalOutlet, CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import { Component, ComponentRef, ElementRef, forwardRef, Inject, Injector, Input, ViewChild } from '@angular/core';
import { ConfirmPopupDirective } from '@gradii/triangle/confirm-popup';
import { TriDialogService } from '@gradii/triangle/dialog';
import { PopoverDirective } from '@gradii/triangle/popover';
import { BaseEntityEvent } from '../../../canvas-core/core-models/base-entity';
import { BaseModel } from '../../../canvas-core/core-models/base-model';
import { ListenerHandle } from '../../../canvas-core/core/base-observer';
import type { CanvasWidget } from '../../../canvas-core/entities/canvas/canvas-widget';
import { CANVAS_WIDGET, ENGINE } from '../../../canvas-core/tokens';
import { DiagramNodeModel } from '../../../models/diagram-node-model';
import { RegistryService } from '../../../node-registry.service';
import { DiagramEngine } from '../../diagram-engine';
import { DIAGRAM_NODE_WIDGET } from './node-common';
import { NodeModel } from './node-model';

@Component({
  selector: 'node-widget',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template : `
    <div class="node"
         #ref
         #nodeConfirmPopup="triConfirmPopup"
         #nodeContextMenu="triContextMenuTriggerFor"
         [triConfirmPopup]="confirmPopupTpl"
         [triConfirmPopupTrigger]="'noop'"
         (onConfirm)="onConfirm(node, inputValue)"
         (onCancel)="onCancel()"
         [triContextMenuTriggerFor]="context_menu"
         [attr.data-nodeid]="node.getID()"
         [style.top.px]="node.getY()"
         [style.left.px]="node.getX()">
      <ng-template [ngIf]="isDefinedNodeComponent(node)" [ngIfElse]="elseDefaultNodeWidget">
        <ng-template [triDiagramNodePortalOutlet]="nodeComponentPortal(node)"
                     [triDiagramNodePortalContext]="{}"
                     (attached)="onAttachedNodePortal(node, $event)"></ng-template>
      </ng-template>
      <ng-template #elseDefaultNodeWidget>
        <x-node-widget [node]="node"></x-node-widget>
      </ng-template>
    </div>
    <ng-template #confirmPopupTpl>
      <textarea name="description" triTextarea [(ngModel)]="inputValue"
                [rows]="4"
                [placeholder]="''"></textarea>
    </ng-template>

    <ng-template #context_menu="triMenuPanel" triMenuPanel>
      <div class="node-menu" triMenu [triMenuPanel]="context_menu">
        <button class="node-menu-item" triMenuItem>Cut</button>
        <button class="node-menu-item" triMenuItem>Copy</button>
        <button class="node-menu-item" triMenuItem>Link</button>
        <button class="node-menu-item" triMenuItem
                (click)="nodeContextMenu.close();">Edit Label
        </button>
        <button class="node-menu-item" triMenuItem
                (click)="nodeContextMenu.close();onEditDescription(node);">Edit Description
        </button>
        <hr/>
        <button class="node-menu-item"
                triMenuItem
                [triMenuTriggerFor]="input_menu">Add Input Port
        </button>
        <button class="node-menu-item"
                triMenuItem
                [triMenuTriggerFor]="output_menu">Add Output Port
        </button>
      </div>
    </ng-template>
    <ng-template #input_menu="triMenuPanel" triMenuPanel>
      <div class="node-menu" triMenu [triMenuPanel]="input_menu">
        <button class="node-menu-item" triMenuItem (click)="onAddInput('text')">Text</button>
        <button class="node-menu-item" triMenuItem>
          <tri-icon svgIcon="outline:close-circle"></tri-icon>
          Error
        </button>
      </div>
    </ng-template>
    <ng-template #output_menu="triMenuPanel" triMenuPanel>
      <div class="node-menu" triMenu [triMenuPanel]="output_menu">
        <button class="node-menu-item" triMenuItem>Text</button>
        <button class="node-menu-item" triMenuItem>String</button>
      </div>
    </ng-template>
  `,
  providers: [
    {provide: DIAGRAM_NODE_WIDGET, useExisting: forwardRef(() => NodeWidget)}
  ],
  styles   : [
    `.node {
      position              : absolute;
      -webkit-touch-callout : none;
      user-select           : none;
      cursor                : move;
      pointer-events        : all;
    }`
  ],
  styleUrls: ['../../../../style/node-widget.scss']
})
export class NodeWidget {
  ob: any;
  ref: ElementRef<HTMLDivElement>;
  listener: ListenerHandle;

  @Input() node: DiagramNodeModel;
  @Input() children?: any;

  @ViewChild(CdkPortalOutlet, {static: true})
  _portalOutlet: CdkPortalOutlet;

  @ViewChild('nodeConfirmPopup', {read: ConfirmPopupDirective, static: true})
  editDescConfirmPopup: ConfirmPopupDirective;

  @ViewChild('nodePopover', {read: PopoverDirective, static: true})
  nodePopover: PopoverDirective;

  // @Input() diagramEngine: DiagramEngine;

  inputValue      = '';
  inputLabelValue = '';

  constructor(
    @Inject(ENGINE) public engine: DiagramEngine,
    @Inject(CANVAS_WIDGET) private canvasWidget: CanvasWidget,
    private _injector: Injector,
    private _registryService: RegistryService,
    private _dialogService: TriDialogService,
  ) {
  }

  isDefinedNodeComponent(nodeModel: DiagramNodeModel) {
    return this._registryService.has(nodeModel.getType());
  }

  nodeComponentPortal(nodeModel: DiagramNodeModel) {
    const portal: ComponentPortal<any> = this._registryService.get(nodeModel.getType());
    return portal;
  }

  onAttachedNodePortal(node: DiagramNodeModel, compRef: CdkPortalOutletAttachedRef) {
    if (compRef instanceof ComponentRef) {
      // tslint:disable-next-line:ban
      Object.assign(compRef.instance, {
        node,
        hi: 'hi'
      });
    }
  }

  onAddInput(type: string) {
    this.node.addInPort(type, type);
    this.engine.repaintCanvas();
  }

  onConfirm(node: DiagramNodeModel, value: string) {
    node.description = value;
    this.restoreDetach();
  }

  onCancel() {
    this.inputValue = '';
    this.restoreDetach();
  }

  onEditDescription(node: DiagramNodeModel) {
    this.reattach();
    // should disable engine any another operator

    this.inputValue = node.description;
    this.editDescConfirmPopup.show(0);
    this.engine.repaintCanvas();

    // // since diagram detach cd. need manual trigger it. default show delay is 100
    // setTimeout(() => {
    //   this.engine.repaintCanvas();
    // }, 20);
  }

  // constructor(props: NodeProps) {
  //   super(props);
  //   this.ref = React.createRef();
  // }

  // componentWillUnmount(): void {
  //   this.ob.disconnect();
  //   this.ob = null;
  //
  //   this.listener.deregister();
  //   this.listener = null;
  // }
  //
  // componentDidUpdate(prevProps: Readonly<NodeProps>, prevState: Readonly<any>, snapshot?: any): void {
  //   if (this.listener && this.node !== prevProps.node) {
  //     this.listener.deregister();
  //     this.installSelectionListener();
  //   }
  // }

  private reattach() {
    this.canvasWidget.cdRef.reattach();
  }

  private restoreDetach() {
    setTimeout(() => {
      this.canvasWidget.cdRef.detach();
    }, 200);
  }

  installSelectionListener() {
    // @ts-ignore
    this.listener = this.node.registerListener({
      selectionChanged: (event: BaseEntityEvent<BaseModel> & { isSelected: boolean }) => {
        // this.forceUpdate();
      }
    });
  }

  // componentDidMount(): void {
  //   // @ts-ignore
  //   this.ob = new ResizeObserver((entities) => {
  //     const bounds = entities[0].contentRect;
  //     this.node.updateDimensions({width: bounds.width, height: bounds.height});
  //
  //     // now mark the links as dirty
  //     _.forEach(this.node.getPorts(), (port) => {
  //       port.updateCoords(this.diagramEngine.getPortCoords(port));
  //     });
  //   });
  //   this.ob.observe(this.ref.current);
  //   this.installSelectionListener();
  // }

  static ngAcceptInputType_node: NodeModel;
}
