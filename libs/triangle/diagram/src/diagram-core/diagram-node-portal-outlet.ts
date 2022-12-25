/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

declare const ngDevMode: boolean;

import { CdkPortalOutletAttachedRef, ComponentPortal, PortalOutlet } from '@angular/cdk/portal';
import {
  ComponentFactoryResolver, ComponentRef, Directive, EventEmitter, Inject, Injector, Input,
  OnDestroy, OnInit, Output, ViewContainerRef
} from '@angular/core';
import { ENGINE } from '../canvas-core/tokens';
import { DIAGRAM_NODE_DATA } from '../tokens';
import { DiagramEngine } from './diagram-engine';


function throwNullPortalError() {
  throw Error('Must provide a portal to attach');
}


function throwPortalAlreadyAttachedError() {
  throw Error('Host already has a portal attached');
}


function throwPortalOutletAlreadyDisposedError() {
  throw Error('This PortalOutlet has already been disposed');
}


function throwUnknownPortalTypeError() {
  throw Error(
    'Attempting to attach an unknown Portal type. BasePortalOutlet accepts either ' +
    'a ComponentPortal or a TemplatePortal.',
  );
}

@Directive({
  selector: '[triDiagramNodePortalOutlet]',
  exportAs: 'triDiagramNodePortalOutlet',
  inputs  : ['portal: triDiagramNodePortalOutlet'],
})
export class DiagramNodePortalOutlet implements PortalOutlet, OnInit, OnDestroy {

  /** Whether the portal component is initialized. */
  private _isInitialized = false;

  /** Reference to the currently-attached component/view ref. */
  private _attachedRef: ComponentRef<any> | null;

  /** The portal currently attached to the host. */
  protected _attachedPortal: ComponentPortal<any> | null;

  /** A function that will permanently dispose this host. */
  private _disposeFn: (() => void) | null;

  /** Whether this host has already been permanently disposed. */
  private _isDisposed: boolean = false;

  /** Whether this host has an attached portal. */
  hasAttached(): boolean {
    return !!this._attachedPortal;
  }

  attach<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!portal) {
        throwNullPortalError();
      }

      if (this.hasAttached()) {
        throwPortalAlreadyAttachedError();
      }

      if (this._isDisposed) {
        throwPortalOutletAlreadyDisposedError();
      }
    }

    if (portal instanceof ComponentPortal) {
      this._attachedPortal = portal;
      return this.attachComponentPortal(portal);
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      throwUnknownPortalTypeError();
    }
    return null;
  }

  /** Detaches a previously attached portal. */
  detach(): void {
    if (this._attachedPortal) {
      this._attachedPortal.setAttachedHost(null);
      this._attachedPortal = null;
    }

    this._invokeDisposeFn();
  }

  /** Permanently dispose of this portal host. */
  dispose(): void {
    if (this.hasAttached()) {
      this.detach();
    }

    this._invokeDisposeFn();
    this._isDisposed = true;
  }

  /** @docs-private */
  setDisposeFn(fn: () => void) {
    this._disposeFn = fn;
  }

  private _invokeDisposeFn() {
    if (this._disposeFn) {
      this._disposeFn();
      this._disposeFn = null;
    }
  }

  constructor(
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    @Inject(ENGINE) private _engine: DiagramEngine,
  ) {
  }

  _attachPendingPortal: ComponentPortal<any> | null;

  /** Portal associated with the Portal outlet. */
  get portal(): ComponentPortal<any> | null {
    return this._attachedPortal;
  }

  set portal(portal: ComponentPortal<any> | null | undefined | '') {
    // Ignore the cases where the `portal` is set to a falsy value before the lifecycle hooks have
    // run. This handles the cases where the user might do something like `<div cdkPortalOutlet>`
    // and attach a portal programmatically in the parent component. When Angular does the first CD
    // round, it will fire the setter with empty string, causing the user's content to be cleared.
    if (this.hasAttached() && !portal && !this._isInitialized) {
      return;
    }

    if (this.hasAttached()) {
      this.detach();
    }

    if (portal) {
      this.attach(portal);
    }

    this._attachedPortal = portal || null;
  }

  _config: { context?: any, data?: any } = {
    context: {},
    data   : {},
  };
  get config() {
    return this._config;
  }

  @Input('triDiagramNodePortalContext')
  set config(value: any) {
    if (value) {
      const {context, data} = value;
      if (context) {
        this._config.context = context;
        if (this._attachedRef) {
          // tslint:disable-next-line:ban
          Object.assign(this._attachedRef.instance, value);
        }
      }
      if (data) {
        // tslint:disable-next-line:ban
        this._config.data = data;
      }
    }
  }

  /** Emits when a portal is attached to the outlet. */
  @Output()
  readonly attached: EventEmitter<CdkPortalOutletAttachedRef> =
    new EventEmitter<CdkPortalOutletAttachedRef>();

  /** Component or view reference that is attached to the portal. */
  get attachedRef(): CdkPortalOutletAttachedRef {
    return this._attachedRef;
  }

  /**
   * Attach the given ComponentPortal to this PortalOutlet using the ComponentFactoryResolver.
   *
   * @param portal Portal to be attached to the portal outlet.
   * @returns Reference to the created component.
   */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    portal.setAttachedHost(this);

    // If the portal specifies an origin, use that as the logical location of the component
    // in the application tree. Otherwise use the location of this PortalOutlet.
    const viewContainerRef = this._viewContainerRef;

    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(
      portal.component);
    const ref              = viewContainerRef.createComponent(
      componentFactory,
      viewContainerRef.length,
      Injector.create({
        providers: [
          {
            provide : DIAGRAM_NODE_DATA,
            useValue: this.config,
          },
          {
            provide : ENGINE,
            useValue: this._engine,
          },
        ],
        parent   : viewContainerRef.injector,
      })
    );

    this.setDisposeFn(() => ref.destroy());
    this._attachedPortal = portal;
    this._attachedRef    = ref;
    this.attached.emit(ref);

    return ref;
  }

  ngOnInit() {
    this._isInitialized = true;
  }

  ngOnDestroy() {
    this.dispose();
    this._attachedPortal = null;
    this._attachedRef    = null;
  }

}
