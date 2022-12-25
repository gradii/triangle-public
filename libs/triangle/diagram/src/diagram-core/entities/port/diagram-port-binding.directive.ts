import { Directive, Host, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { ENGINE } from '../../../canvas-core/tokens';
import { DiagramEngine } from '../../diagram-engine';
import { PortModel } from './port-model';
import { PortWidget } from './port-widget';


@Directive({
  selector: '[triDiagramPortBinding]'
})
export class DiagramPortBindingDirective implements OnInit, OnDestroy {

  @Input('triDiagramPortBinding')
  portModel: PortModel;

  constructor(
    @Inject(ENGINE) public engine: DiagramEngine,
    @Host() portWidget: PortWidget
  ) {
  }

  ngOnInit() {
    this.engine.renderedPorts.add(this.portModel);
  }

  ngOnDestroy() {
    this.engine.renderedPorts.delete(this.portModel);
  }

}