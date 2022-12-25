/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ObserversModule } from '@angular/cdk/observers';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';

import { CommonModule } from '@angular/common';
import { Inject, NgModule, Optional, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TriCardModule } from '@gradii/triangle/card';
import { TriConfirmPopupModule } from '@gradii/triangle/confirm-popup';
import { TriDialogModule } from '@gradii/triangle/dialog';
import { TriIconModule } from '@gradii/triangle/icon';
import { TriInputModule } from '@gradii/triangle/input';
import { TriMenuModule } from '@gradii/triangle/menu';
import { TriPopoverModule } from '@gradii/triangle/popover';
import { CanvasWidget } from './canvas-core/entities/canvas/canvas-widget';
import { TransformLayerWidget } from './canvas-core/entities/layer/transform-layer-widget';
import { SelectionBoxWidget } from './canvas-core/entities/selection/selection-box-widget';
import { DragCanvasState } from './canvas-core/states/drag-canvas-state';
import { ENGINE_OPTIONS } from './canvas-core/tokens';
import { DiagramNodePortalOutlet } from './diagram-core/diagram-node-portal-outlet';
import { LabelWidget } from './diagram-core/entities/label/label-widget';
import { LinkWidget } from './diagram-core/entities/link/link-widget';
import { NodeLayerWidget } from './diagram-core/entities/node-layer/node-layer-widget';
import { NodeWidget } from './diagram-core/entities/node/node-widget';
import { DiagramPortBindingDirective } from './diagram-core/entities/port/diagram-port-binding.directive';
import { PortWidget } from './diagram-core/entities/port/port-widget';
import { PathDirective } from './diagram-core/path.directive';
import { DefaultDiagramState } from './diagram-core/states/default-diagram-state';
import { DragDiagramItemsState } from './diagram-core/states/drag-diagram-items-state';
import { DragNewLinkState } from './diagram-core/states/drag-new-link-state';
import { TriLinkModule } from './diagram-core/tri/tri-link.module';
import { XLabelWidget } from './diagram-core/x/x-label-widget';
import { XLinkPointWidget } from './diagram-core/x/link/x-link-point-widget';
import { XLinkSegmentWidget } from './diagram-core/x/link/x-link-segment-widget';
import { XLinkWidget } from './diagram-core/x/x-link-widget';
import { XNodeWidget } from './diagram-core/x/x-node-widget';
import { XPortLabelWidget } from './diagram-core/x/x-port-label-widget';
import { DiagramComponent } from './diagram.component';
import { RegistryService } from './node-registry.service';
import { DIAGRAM_NODE_COMPONENTS, DIAGRAM_STATES } from './tokens';
import { ComponentProviderOptions } from './types';


/**
 * <!-- example(diagram:diagram-workflow-example) -->
 * <!-- example(diagram:diagram-simple-example) -->
 * <!-- example(diagram:diagram-settings-example) -->
 * <!-- example(diagram:diagram-drag-and-drop-example) -->
 * <!-- example(diagram:diagram-custom-node-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    FormsModule,
    ObserversModule,
    PortalModule,

    TriMenuModule,
    TriIconModule,
    TriDialogModule,
    TriCardModule,
    TriConfirmPopupModule,
    TriInputModule,
    TriPopoverModule,

    TriLinkModule,
    // CanvasEngineModule,
    // DefaultsModule,
    // DiagramCoreModule,
  ],
  declarations: [
    DiagramComponent,

    TransformLayerWidget,
    // SelectionBoxLayerFactory,
    SelectionBoxWidget,

    CanvasWidget,
    // SmartLayerWidget,

    //
    // DefaultLabelFactory,
    // DefaultLabelWidget,
    //
    // DefaultLinkFactory,
    // DefaultLinkWidget,
    // DefaultLinkPointWidget,
    // DefaultLinkSegmentWidget,
    //
    // DefaultNodeFactory,
    // DefaultNodeWidget,
    //
    // DefaultPortFactory,
    // DefaultPortLabelWidget,


    NodeWidget,

    // NodeLayerFactory,
    NodeLayerWidget,

    LabelWidget,

    LinkWidget,

    PortWidget,

    XLabelWidget,
    XNodeWidget,
    XPortLabelWidget,
    XLinkWidget,
    XLinkPointWidget,
    XLinkSegmentWidget,

    PathDirective,
    DiagramNodePortalOutlet,

    DiagramPortBindingDirective
  ],
  exports     : [
    DiagramComponent,
    XLabelWidget,
    XNodeWidget,
    XPortLabelWidget,
    XLinkWidget,
    XLinkPointWidget,
    XLinkSegmentWidget,

    // DefaultLabelFactory,
    // DefaultLabelWidget,
    //
    // DefaultLinkFactory,
    // DefaultLinkWidget,
    // DefaultLinkPointWidget,
    // DefaultLinkSegmentWidget,
    //
    // DefaultNodeFactory,
    // DefaultNodeWidget,
    //
    // DefaultPortFactory,
    // DefaultPortLabelWidget,
  ],
  providers   : [
    {
      provide: DIAGRAM_STATES, useClass: DefaultDiagramState, multi: true,
    },
    DragCanvasState,
    DragNewLinkState,
    DragDiagramItemsState,
    {
      provide: ENGINE_OPTIONS, useValue: {},
    }
  ]
})
export class TriDiagramModule {
  constructor(
    registry: RegistryService,
    @Inject(DIAGRAM_NODE_COMPONENTS) @Optional() components: ComponentProviderOptions[]
  ) {
    components?.forEach(({type, component}) => {
        let portal = component;
        if (!(portal instanceof ComponentPortal)) {
          portal = new ComponentPortal(component as Type<any>);
        }
        registry.set(type, portal);
      }
    );
  }
}
