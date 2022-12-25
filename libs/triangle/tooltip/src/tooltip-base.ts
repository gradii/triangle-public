/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AriaDescriber, FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { BooleanInput, coerceBooleanProperty, NumberInput } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import {
  ConnectedPosition, ConnectionPositionPair, FlexibleConnectedPositionStrategy,
  HorizontalConnectionPos, OriginConnectionPosition, Overlay, OverlayConnectionPosition, OverlayRef,
  ScrollStrategy, VerticalConnectionPos
} from '@angular/cdk/overlay';
import { normalizePassiveListenerOptions, Platform } from '@angular/cdk/platform';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit, Directive, ElementRef, Inject, Input, NgZone, OnDestroy, TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { isString } from '@gradii/nanofn';
import { DEFAULT_4_POSITIONS, POSITION_MAP_LTR, POSITION_MAP_RTL } from '@gradii/triangle/core';

import { Subject } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { _TriTooltipComponentBase } from './tooltip-component-base';
import { getTriTooltipInvalidPositionError, TriggerType } from './tooltip.common';
import {
  TooltipPosition, TooltipTouchGestures, TriTooltipDefaultOptions
} from './tooltip.interface';

declare const ngDevMode: object | null;

/**
 * Time between the user putting the pointer on a tooltip
 * trigger and the long press event being fired.
 */
const LONGPRESS_DELAY = 500;


/** Options used to bind passive event listeners. */
const passiveListenerOptions = normalizePassiveListenerOptions({passive: true});


@Directive()
export abstract class _TriTooltipBase<T extends _TriTooltipComponentBase> implements OnDestroy,
  AfterViewInit {
  _overlayRef: OverlayRef | null;
  _tooltipInstance: T | null;

  private _portal: ComponentPortal<T>;
  private _position: TooltipPosition = 'top';

  private _disabled: boolean            = false;
  private _tooltipClass: string | string[] | Set<string> | { [key: string]: any };
  private _tooltipContext: { [key: string]: any };
  private _scrollStrategy: () => ScrollStrategy;
  private _viewInitialized              = false;
  private _pointerExitEventsInitialized = false;
  protected abstract readonly _tooltipComponent: ComponentType<T>;
  protected _viewportMargin             = 8;
  private _currentPosition: TooltipPosition;

  protected _tooltipPrefix = 'tri-tooltip';

  @Input('triTooltipWidth') width: number;
  @Input('triTooltipMaxWidth') maxWidth: number;
  @Input('triTooltipMinWidth') minWidth: number;

  @Input('triTooltipHeight') height: number;
  @Input('triTooltipMaxHeight') maxHeight: number;
  @Input('triTooltipMinHeight') minHeight: number;


  /** Allows the user to define the position of the tooltip relative to the parent element */
  @Input('triTooltipPosition')
  get position(): TooltipPosition {
    return this._position;
  }

  set position(value: TooltipPosition) {
    if (value !== this._position) {
      this._position = value;

      if (this._overlayRef) {
        this._updatePosition();

        if (this._tooltipInstance) {
          this._tooltipInstance!.show(0);
        }

        this._overlayRef.updatePosition();
      }
    }
  }

  /** Disables the display of the tooltip. */
  @Input('triTooltipDisabled')
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);

    // If tooltip is disabled, hide immediately.
    if (this._disabled) {
      this.hide(0);
    } else {
      if (this._tooltipTrigger === TriggerType.HOVER) {
        this._setupPointerEnterEventsIfNeeded();
      }
    }
  }

  /** The default delay in ms before showing the tooltip after show is called */
  @Input('triTooltipShowDelay') showDelay: number = this._defaultOptions.showDelay;

  /** The default delay in ms before hiding the tooltip after hide is called */
  @Input('triTooltipHideDelay') hideDelay: number = this._defaultOptions.hideDelay;

  /**
   * - `auto` - Enables touch gestures for all elements, but tries to avoid conflicts with native
   *   browser gestures on particular elements. In particular, it allows text selection on inputs
   *   and textareas, and preserves the native browser dragging on elements marked as `draggable`.
   * - `on` - Enables touch gestures for all elements and disables native
   *   browser gestures with no exceptions.
   * - `off` - Disables touch gestures. Note that this will prevent the tooltip from
   *   showing on touch devices.
   */
  @Input('triTooltipTouchGestures') touchGestures: TooltipTouchGestures = 'auto';

  /** The message to be displayed in the tooltip */
  @Input('triTooltip')
  get content() {
    return this._content;
  }

  set content(value: string | TemplateRef<any>) {
    if (isString(value)) {
      this._ariaDescriber.removeDescription(this._elementRef.nativeElement, this._content as string,
        'tooltip');
    }
    this._content = isString(value) ? String(value).trim() : value;

    if (!this._content && this._isTooltipVisible()) {
      this.hide(0);
    } else {
      this._setupPointerEnterEventsIfNeeded();
      this._updateTooltipMessage();
      this._ngZone.runOutsideAngular(() => {
        if (isString(this._content)) {
          Promise.resolve().then(() => {
            this._ariaDescriber.describe(this._elementRef.nativeElement, this._content as string,
              'tooltip');
          });
        }
      });
    }
  }

  private _content: string | TemplateRef<any> = '';

  @Input('triTooltipTrigger')
  get tooltipTrigger(): TriggerType {
    return this._tooltipTrigger;
  }

  set tooltipTrigger(value: TriggerType) {
    this._tooltipTrigger = value;

    this._passiveListeners.forEach(([event, listener]) => {
      this._elementRef.nativeElement.removeEventListener(event, listener, passiveListenerOptions);
    });
    this._passiveListeners.length = 0;
    this._setupPointerEnterEventsIfNeeded();
  }

  _tooltipTrigger: TriggerType = TriggerType.HOVER;

  // _tooltipTriggerSubscriptions: Subscription[]         = [];

  /** Classes to be passed to the tooltip. Supports the same syntax as `ngClass`. */
  @Input('triTooltipClass')
  get tooltipClass() {
    return this._tooltipClass;
  }

  set tooltipClass(value: string | string[] | Set<string> | { [key: string]: any }) {
    this._tooltipClass = value;
    if (this._tooltipInstance) {
      this._setTooltipClass(this._tooltipClass);
    }
  }

  @Input('triTooltipContext')
  get tooltipContext() {
    return this._tooltipContext;
  }

  set tooltipContext(value: { [key: string]: any }) {
    this._tooltipContext = value;
    if (this._tooltipInstance) {
      this._setTooltipContext(this._tooltipContext);
    }
  }

  /** Manually-bound passive event listeners. */
  private readonly _passiveListeners:
    (readonly [string, EventListenerOrEventListenerObject])[] = [];

  /** Reference to the current document. */
  private _document: Document;

  /** Timer started at the last `touchstart` event. */
  private _touchstartTimeout: number;

  /** Emits when the component is destroyed. */
  protected readonly _destroyed = new Subject<void>();

  constructor(
    protected _overlay: Overlay,
    protected _elementRef: ElementRef<HTMLElement>,
    protected _scrollDispatcher: ScrollDispatcher,
    protected _viewContainerRef: ViewContainerRef,
    protected _ngZone: NgZone,
    protected _platform: Platform,
    protected _ariaDescriber: AriaDescriber,
    protected _focusMonitor: FocusMonitor,
    scrollStrategy: any,
    protected _dir: Directionality,
    private _defaultOptions: TriTooltipDefaultOptions,
    @Inject(DOCUMENT) _document: any) {

    this._scrollStrategy = scrollStrategy;
    this._document       = _document;

    if (_defaultOptions) {
      if (_defaultOptions.position) {
        this.position = _defaultOptions.position;
      }

      if (_defaultOptions.touchGestures) {
        this.touchGestures = _defaultOptions.touchGestures;
      }
    }

    _ngZone.runOutsideAngular(() => {
      _elementRef.nativeElement.addEventListener('keydown', this._handleKeydown);
    });
  }

  ngAfterViewInit() {
    // This needs to happen after view init so the initial values for all inputs have been set.
    this._viewInitialized = true;
    this._setupPointerEnterEventsIfNeeded();
  }

  /**
   * Dispose the tooltip when destroyed.
   */
  ngOnDestroy() {
    const nativeElement = this._elementRef.nativeElement;

    clearTimeout(this._touchstartTimeout);

    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._tooltipInstance = null;
    }

    // Clean up the event listeners set in the constructor
    nativeElement.removeEventListener('keydown', this._handleKeydown);
    this._passiveListeners.forEach(([event, listener]) => {
      nativeElement.removeEventListener(event, listener, passiveListenerOptions);
    });
    this._passiveListeners.length = 0;

    this._destroyed.next();
    this._destroyed.complete();

    if (isString(this.content)) {
      this._ariaDescriber.removeDescription(nativeElement, this.content, 'tooltip');
    }
    this._focusMonitor.stopMonitoring(nativeElement);
  }

  /** Shows the tooltip after the delay in ms, defaults to tooltip-delay-show or 0ms if no input */
  show(delay: number = this.showDelay): void {
    if (this.disabled || !this.content || (this._isTooltipVisible() &&
      !this._tooltipInstance!._showTimeoutId && !this._tooltipInstance!._hideTimeoutId)) {
      return;
    }

    const overlayRef = this._createOverlay();
    this._detach();
    this._portal                 = this._portal ||
      new ComponentPortal(this._tooltipComponent, this._viewContainerRef);
    this._tooltipInstance        = overlayRef.attach(this._portal).instance;
    this._tooltipInstance.config = {
      triggerType: this._tooltipTrigger,
      showDelay  : this.showDelay,
      hideDelay  : this.hideDelay
    };
    this._tooltipInstance.afterHidden()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());
    this._setTooltipClass(this._tooltipClass);
    this._setTooltipContext(this._tooltipContext);
    this._updateTooltipMessage();
    this._tooltipInstance!.show(delay);
  }

  /** Hides the tooltip after the delay in ms, defaults to tooltip-delay-hide or 0ms if no input */
  hide(delay: number = this.hideDelay): void {
    if (this._tooltipInstance) {
      this._tooltipInstance.hide(delay);
    }
  }

  /** Shows/hides the tooltip */
  toggle(): void {
    this._isTooltipVisible() ? this.hide() : this.show();
  }

  /** Returns true if the tooltip is currently visible to the user */
  _isTooltipVisible(): boolean {
    return !!this._tooltipInstance && this._tooltipInstance.isVisible();
  }

  /**
   * Handles the keydown events on the host element.
   * Needs to be an arrow function so that we can use it in addEventListener.
   */
  private _handleKeydown = (event: KeyboardEvent) => {
    if (this._isTooltipVisible() && event.keyCode === ESCAPE && !hasModifierKey(event)) {
      event.preventDefault();
      event.stopPropagation();
      this._ngZone.run(() => this.hide(0));
    }
  };

  /** Create the overlay config and position strategy */
  private _createOverlay(): OverlayRef {
    if (this._overlayRef) {
      return this._overlayRef;
    }

    const scrollableAncestors =
            this._scrollDispatcher.getAncestorScrollContainers(this._elementRef);

    // Create connected position strategy that listens for scroll events to reposition.
    const strategy = this._overlay.position()
      .flexibleConnectedTo(this._elementRef)
      .withTransformOriginOn(`.${this._tooltipPrefix}`)
      .withFlexibleDimensions(false)
      .withViewportMargin(this._viewportMargin)
      .withScrollableContainers(scrollableAncestors);

    strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe(change => {
      this._updateCurrentPositionClass(change.connectionPair);

      if (this._tooltipInstance) {
        if (change.scrollableViewProperties.isOverlayClipped && this._tooltipInstance.isVisible()) {
          // After position changes occur and the overlay is clipped by
          // a parent scrollable then close the tooltip.
          this._ngZone.run(() => this.hide(0));
        }
      }
    });

    this._overlayRef = this._overlay.create({
      direction       : this._dir,
      positionStrategy: strategy,
      panelClass      : `${this._tooltipPrefix}-panel`,
      scrollStrategy  : this._scrollStrategy(),
      width           : this.width,
      maxWidth        : this.maxWidth,
      minWidth        : this.minWidth,
      height          : this.height,
      maxHeight       : this.maxHeight,
      minHeight       : this.minHeight,
    });

    this._updatePosition();

    if (this._tooltipTrigger === TriggerType.HINT) {
      this._overlayRef.outsidePointerEvents().pipe(
        takeUntil(this._destroyed),
        tap(() => {
          this.hide(50);
        })
      ).subscribe();
    }

    this._overlayRef.detachments()
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => this._detach());

    return this._overlayRef;
  }

  /** Detaches the currently-attached tooltip. */
  private _detach() {
    if (this._overlayRef && this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }

    this._tooltipInstance = null;
  }

  /** Updates the position of the current tooltip. */
  private _updatePosition() {
    const position =
            this._overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
    const origin   = this._getOrigin();
    const overlay  = this._getOverlayPosition();

    position.withPositions([
      this._addOffset({...origin.main, ...overlay.main}),
      this._addOffset({...origin.fallback, ...overlay.fallback}),
      // todo check
      ...DEFAULT_4_POSITIONS
    ]);
  }

  /** Adds the configured offset to a position. Used as a hook for child classes. */
  protected _addOffset(position: ConnectedPosition): ConnectedPosition {
    return position;
  }

  /**
   * Returns the origin position and a fallback position based on the user's position preference.
   * The fallback position is the inverse of the origin (e.g. `'bottom' -> 'top'`).
   */
  _getOrigin(): { main: OriginConnectionPosition, fallback: OriginConnectionPosition } {
    const isLtr    = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let originPosition: OriginConnectionPosition;

    if (isLtr) {
      originPosition = POSITION_MAP_LTR[position];
    } else {
      originPosition = POSITION_MAP_RTL[position];
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!originPosition) {
        throw getTriTooltipInvalidPositionError(position);
      }
    }

    const {x, y} = this._invertPosition(originPosition!.originX, originPosition!.originY);

    return {
      main    : {originX: originPosition.originX, originY: originPosition.originY}!,
      fallback: {originX: x, originY: y}
    };
  }

  /** Returns the overlay position and a fallback position based on the user's preference */
  _getOverlayPosition(): { main: OverlayConnectionPosition, fallback: OverlayConnectionPosition } {
    const isLtr    = !this._dir || this._dir.value == 'ltr';
    const position = this.position;
    let overlayPosition: OverlayConnectionPosition;

    if (isLtr) {
      overlayPosition = POSITION_MAP_LTR[position];
    } else {
      overlayPosition = POSITION_MAP_RTL[position];
    }

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!overlayPosition) {
        throw getTriTooltipInvalidPositionError(position);
      }
    }

    const {x, y} = this._invertPosition(overlayPosition!.overlayX, overlayPosition!.overlayY);

    return {
      main    : {overlayX: overlayPosition.overlayX, overlayY: overlayPosition.overlayY}!,
      fallback: {overlayX: x, overlayY: y}
    };
  }

  /** Updates the tooltip message and repositions the overlay according to the new message length */
  private _updateTooltipMessage() {
    // Must wait for the message to be painted to the tooltip so that the overlay can properly
    // calculate the correct positioning based on the size of the text.
    if (this._tooltipInstance) {
      this._tooltipInstance.content = this.content;
      this._tooltipInstance._markForCheck();

      this._ngZone.onMicrotaskEmpty.pipe(
        take(1),
        takeUntil(this._destroyed)
      ).subscribe(() => {
        if (this._tooltipInstance) {
          this._overlayRef!.updatePosition();
        }
      });
    }
  }

  /** Updates the tooltip class */
  private _setTooltipClass(tooltipClass: string | string[] | Set<string> | { [key: string]: any }) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipClass = tooltipClass;
      this._tooltipInstance._markForCheck();
    }
  }

  private _setTooltipContext(tooltipContext: { [key: string]: any }) {
    if (this._tooltipInstance) {
      this._tooltipInstance.tooltipContext = tooltipContext;
      this._tooltipInstance._markForCheck();
    }
  }

  /** Inverts an overlay position. */
  private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
    if (this.position === 'top' || this.position === 'bottom') {
      if (y === 'top') {
        y = 'bottom';
      } else if (y === 'bottom') {
        y = 'top';
      }
    } else {
      if (x === 'end') {
        x = 'start';
      } else if (x === 'start') {
        x = 'end';
      }
    }

    return {x, y};
  }

  /** Updates the class on the overlay panel based on the current position of the tooltip. */
  private _updateCurrentPositionClass(connectionPair: ConnectionPositionPair): void {
    const {overlayX, overlayY, originX, originY} = connectionPair;
    let newPosition: TooltipPosition;

    // If the overlay is in the middle along the Y axis,
    // it means that it's either before or after.
    // if (overlayY === 'center') {
    //   // Note that since this information is used for styling, we want to
    //   // resolve `start` and `end` to their real values, otherwise consumers
    //   // would have to remember to do it themselves on each consumption.
    //   if (this._dir && this._dir.value === 'rtl') {
    //     newPosition = originX === 'end' ? 'left' : 'right';
    //   } else {
    //     newPosition = originX === 'start' ? 'left' : 'right';
    //   }
    // } else {
    //   newPosition = overlayY === 'bottom' && originY === 'top' ? 'top' : 'bottom';
    // }

    const targetMap = this._dir && this._dir.value === 'rtl' ? POSITION_MAP_RTL : POSITION_MAP_LTR;

    for (const [key, target] of Object.entries(targetMap)) {
      if (target.originX === originX &&
        target.originY === originY &&
        target.overlayX === overlayX &&
        target.overlayY === overlayY
      ) {
        newPosition = (key as TooltipPosition);
        break;
      }
    }

    if (newPosition! !== this._currentPosition) {
      const overlayRef = this._overlayRef;

      if (overlayRef) {
        const classPrefix = `${this._tooltipPrefix}-placement-`;
        overlayRef.removePanelClass(classPrefix + this._currentPosition);
        overlayRef.addPanelClass(classPrefix + newPosition!);
      }

      this._currentPosition = newPosition!;
    }
  }

  /** Binds the pointer events to the tooltip trigger. */
  private _setupPointerEnterEventsIfNeeded() {
    // Optimization: Defer hooking up events if there's no message or the tooltip is disabled.
    if (this._disabled || !this.content || !this._viewInitialized ||
      this._passiveListeners.length) {
      return;
    }

    if (this._tooltipTrigger === TriggerType.HOVER) {
      // The mouse events shouldn't be bound on mobile devices, because they can prevent the
      // first tap from firing its click event or can cause the tooltip to open for clicks.
      if (this._platformSupportsMouseEvents()) {
        this._passiveListeners
          .push([
            'mouseenter', () => {
              this._setupPointerExitEventsIfNeeded();
              this.show();
            }
          ]);
      } else if (this.touchGestures !== 'off') {
        this._disableNativeGesturesIfNecessary();

        this._passiveListeners
          .push([
            'touchstart', () => {
              // Note that it's important that we don't `preventDefault` here,
              // because it can prevent click events from firing on the element.
              this._setupPointerExitEventsIfNeeded();
              clearTimeout(this._touchstartTimeout);
              // @ts-ignore
              this._touchstartTimeout = setTimeout(() => this.show(), LONGPRESS_DELAY);
            }
          ]);
      }
    } else if (
      this._tooltipTrigger === TriggerType.CLICK ||
      this._tooltipTrigger === TriggerType.HINT
    ) {
      this._passiveListeners
        .push([
          'click', () => {
            this.toggle();
          }
        ]);
    }

    this._addListeners(this._passiveListeners);
  }

  private _setupPointerExitEventsIfNeeded() {
    if (this._pointerExitEventsInitialized) {
      return;
    }
    this._pointerExitEventsInitialized = true;

    const exitListeners: (readonly [string, EventListenerOrEventListenerObject])[] = [];
    if (this._platformSupportsMouseEvents()) {
      exitListeners.push(
        ['mouseleave', () => this.hide()],
        ['wheel', event => this._wheelListener(event as WheelEvent)]
      );
    } else if (this.touchGestures !== 'off') {
      this._disableNativeGesturesIfNecessary();
      const touchendListener = () => {
        clearTimeout(this._touchstartTimeout);
        this.hide(this._defaultOptions.touchendHideDelay);
      };

      exitListeners.push(
        ['touchend', touchendListener],
        ['touchcancel', touchendListener],
      );
    }

    this._addListeners(exitListeners);
    this._passiveListeners.push(...exitListeners);
  }

  private _addListeners(
    listeners: (readonly [string, EventListenerOrEventListenerObject])[]) {
    listeners.forEach(([event, listener]) => {
      this._elementRef.nativeElement.addEventListener(event, listener, passiveListenerOptions);
    });
  }

  private _platformSupportsMouseEvents() {
    return !this._platform.IOS && !this._platform.ANDROID;
  }

  /** Listener for the `wheel` event on the element. */
  private _wheelListener(event: WheelEvent) {
    if (this._isTooltipVisible()) {
      const elementUnderPointer = this._document.elementFromPoint(event.clientX, event.clientY);
      const element             = this._elementRef.nativeElement;

      // On non-touch devices we depend on the `mouseleave` event to close the tooltip, but it
      // won't fire if the user scrolls away using the wheel without moving their cursor. We
      // work around it by finding the element under the user's cursor and closing the tooltip
      // if it's not the trigger.
      if (elementUnderPointer !== element && !element.contains(elementUnderPointer)) {
        this.hide();
      }
    }
  }

  /** Disables the native browser gestures, based on how the tooltip has been configured. */
  private _disableNativeGesturesIfNecessary() {
    const gestures = this.touchGestures;

    if (gestures !== 'off') {
      const element = this._elementRef.nativeElement;
      const style   = element.style;

      // If gestures are set to `auto`, we don't disable text selection on inputs and
      // textareas, because it prevents the user from typing into them on iOS Safari.
      if (gestures === 'on' || (element.nodeName !== 'INPUT' && element.nodeName !== 'TEXTAREA')) {
        style.userSelect = (style as any).msUserSelect = style.webkitUserSelect =
          (style as any).MozUserSelect = 'none';
      }

      // If we have `auto` gestures and the element uses native HTML dragging,
      // we don't set `-webkit-user-drag` because it prevents the native behavior.
      if (gestures === 'on' || !element.draggable) {
        (style as any).webkitUserDrag = 'none';
      }

      style.touchAction                      = 'none';
      (style as any).webkitTapHighlightColor = 'transparent';
    }
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_hideDelay: NumberInput;
  static ngAcceptInputType_showDelay: NumberInput;
  static ngAcceptInputType_tooltipTrigger: TriggerType | 'click' | 'hover' | 'noop' | string;
}
