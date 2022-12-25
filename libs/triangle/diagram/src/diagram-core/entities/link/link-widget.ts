/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ComponentRef, Inject, Injector, Input, NgZone, OnChanges, OnDestroy,
  OnInit, Optional, SimpleChanges, Type, ViewChild, ViewContainerRef
} from '@angular/core';
import { merge, Subject, tap } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import { ENGINE } from '../../../canvas-core/tokens';
import { DiagramLinkModel } from '../../../models/diagram-link-model';
import { LINK_COMPONENTS } from '../../../tokens';
import { DiagramEngine } from '../../diagram-engine';
import { XLinkWidget } from '../../x/x-link-widget';
import { LinkModel } from './link-model';

@Component({
  selector       : 'g[tri-link-widget]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ng-container #container></ng-container>
    <!--        <svg:g tri-x-link-widget [link]="link"></svg:g>-->

    <ng-template let-labelModel let-index="index" ngFor [ngForOf]="link.getLabels()">
      <svg:foreignObject class="foreignObject" [attr.key]="labelModel.getID()">
        <label-widget [label]="labelModel"
                      [index]="index"></label-widget>
      </svg:foreignObject>
    </ng-template>
  `,
  styles         : [
    `.foreignObject {
      pointer-events : none;
      overflow       : visible;
      x              : 0;
      y              : 0;
      width          : 100%;
      height         : 100%;
    }
    `
  ]
})
export class LinkWidget implements OnChanges, OnInit, OnDestroy {

  @Input() link: LinkModel;

  // _sourcePort: PortModel;
  // _targetPort: PortModel;
  @ViewChild('container', {read: ViewContainerRef, static: true})
  container: ViewContainerRef;


  _linkComponentRef: ComponentRef<any> | null;

  subject = new Subject();

  constructor(@Inject(ENGINE) public engine: DiagramEngine,
              @Optional()
              @Inject(LINK_COMPONENTS)
              private LinkTypes: { type: string, component: Type<any> }[] = [],
              private _injector: Injector,
              private _ngZone: NgZone,
              private _cdRef: ChangeDetectorRef) {
    _cdRef.detach();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['link']) {
      const linkValue = changes['link'].currentValue;
      // this._targetPort = linkValue.getSourcePort();
      // this._targetPort = linkValue.getTargetPort();
      this._attachLink(linkValue);
      this._bindLink();
    }
  }

  _attachLink(linkValue) {
    if (!this.link) {
      return;
    }
    if (this._linkComponentRef) {
      this._linkComponentRef.destroy();
    }

    const Comp                      = this.LinkTypes.find(it => it.type === linkValue.type)?.component || XLinkWidget;
    Comp['ɵcmp']['selectors'][0][0] = {
      toString   : () => 'g',
      toLowerCase: () => 'svg'
    };

    // const node             = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    // const factory          = this.componentFactoryResolver.resolveComponentFactory(Comp);
    // this._linkComponentRef = factory.create(this.container.injector, [], node);
    this._linkComponentRef = this.container.createComponent(Comp,
      {
        index: 0, injector: this._injector,
      });

    this._linkComponentRef.instance.link  = linkValue;
    this._linkComponentRef.instance.curve = (this.link as DiagramLinkModel).curve;
    this._linkComponentRef.changeDetectorRef.detectChanges();
    this._cdRef.markForCheck();
  }

  enable() {
    const {link} = this;

    // only draw the link when we have reported positions
    if (link.getSourcePort() && !link.getSourcePort().reportedPosition) {
      return false;
    }
    if (link.getTargetPort() && !link.getTargetPort().reportedPosition) {
      return false;
    }
    return true;
  }

  _bindLink() {
    if (!this.link) {
      return;
    }
    this._ngZone.runOutsideAngular(() => {
      merge(
        this.link.selectionChanged,
        this.link.portChanged,
        this.link.reportInitialPosition,
      ).pipe(
        takeUntil(this.subject),
        // throttleTime(1, undefined, {leading: true, trailing: true}),
        tap(() => {
          this._cdRef.detectChanges();
        })
      ).subscribe();
    });
  }

  ngOnInit() {
    this._bindLink();
  }

  ngOnDestroy() {
    this.subject.complete();
  }

}
