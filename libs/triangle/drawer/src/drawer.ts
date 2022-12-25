/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AnimationEvent } from '@angular/animations';
import {
  FocusMonitor, FocusOrigin, FocusTrap, FocusTrapFactory, InteractivityChecker
} from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
  AfterContentChecked, AfterContentInit, ChangeDetectionStrategy, Component, ElementRef,
  EventEmitter, HostBinding, HostListener, Inject, Input, NgZone, OnDestroy, Optional, Output,
  ViewEncapsulation,
} from '@angular/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, mapTo, take, takeUntil, } from 'rxjs/operators';
import { TRI_DRAWER_CONTAINER } from './common';
import { triDrawerAnimations } from './drawer-animations';
import type { TriDrawerContainer } from './drawer-container';
import { AutoFocusTarget, TriDrawerMode, TriDrawerToggleResult } from './drawer.types';

/**
 * This component corresponds to a drawer that can be opened on the drawer container.
 */
@Component({
  selector       : 'tri-drawer',
  exportAs       : 'triDrawer',
  templateUrl    : 'drawer.html',
  animations     : [triDrawerAnimations.transformDrawer],
  host           : {
    'class': 'tri-drawer',
    // must prevent the browser from aligning text based on value
    '[attr.align]'             : 'null',
    '[class.tri-drawer-end]'   : 'position === "end"',
    '[class.tri-drawer-over]'  : 'mode === "over"',
    '[class.tri-drawer-push]'  : 'mode === "push"',
    '[class.tri-drawer-side]'  : 'mode === "side"',
    '[class.tri-drawer-opened]': 'opened',
    'tabIndex'                 : '-1',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
})
export class TriDrawer implements AfterContentInit, AfterContentChecked, OnDestroy {
  static ngAcceptInputType_disableClose: BooleanInput;
  static ngAcceptInputType_autoFocus: AutoFocusTarget | string | BooleanInput;
  static ngAcceptInputType_opened: BooleanInput;

  /** Emits whenever the drawer has started animating. */
  readonly _animationStarted                                       = new Subject<AnimationEvent>();
  /** Emits whenever the drawer is done animating. */
  readonly _animationEnd                                           = new Subject<AnimationEvent>();
  /** Current state of the sidenav animation. */
  // @HostBinding is used in the class as it is expected to be extended.  Since @Component decorator
  // metadata is not inherited by child classes, instead the host binding data is defined in a way
  // that can be inherited.
  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostBinding('@transform')
  _animationState: 'open-instant' | 'open' | 'void'                = 'void';
  /** Event emitted when the drawer open state is changed. */
  @Output() readonly openedChange: EventEmitter<boolean>           =
    // Note this has to be async in order to avoid some issues with two-bindings (see #8872).
    new EventEmitter<boolean>(/* isAsync */true);
  /** Event emitted when the drawer has been opened. */
  @Output('opened')
  readonly _openedStream                                           = this.openedChange.pipe(
    filter(o => o), map(() => {
    }));
  /** Event emitted when the drawer has started opening. */
  @Output()
  readonly openedStart: Observable<void>                           = this._animationStarted.pipe(
    filter(e => e.fromState !== e.toState && e.toState.indexOf('open') === 0),
    mapTo(undefined)
  );
  /** Event emitted when the drawer has been closed. */
  @Output('closed')
  readonly _closedStream                                           = this.openedChange.pipe(
    filter(o => !o), map(() => {
    }));
  /** Event emitted when the drawer has started closing. */
  @Output()
  readonly closedStart: Observable<void>                           = this._animationStarted.pipe(
    filter(e => e.fromState !== e.toState && e.toState === 'void'),
    mapTo(undefined)
  );
  /** Event emitted when the drawer's position changes. */
  // tslint:disable-next-line:no-output-on-prefix
  @Output('positionChanged') readonly onPositionChanged            = new EventEmitter<void>();
  /**
   * An observable that emits when the drawer mode changes. This is used by the drawer container to
   * to know when to when the mode changes so it can adapt the margins on the content.
   */
  readonly _modeChanged                                            = new Subject<void>();
  private _focusTrap: FocusTrap;
  private _elementFocusedBeforeDrawerWasOpened: HTMLElement | null = null;
  /** Whether the drawer is initialized. Used for disabling the initial animation. */
  private _enableAnimations                                        = false;
  /** How the sidenav was opened (keypress, mouse click etc.) */
  private _openedVia: FocusOrigin | null;
  /** Emits when the component is destroyed. */
  private readonly _destroyed                                      = new Subject<void>();

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _focusTrapFactory: FocusTrapFactory,
              private _focusMonitor: FocusMonitor,
              private _platform: Platform,
              private _ngZone: NgZone,
              private readonly _interactivityChecker: InteractivityChecker,
              @Optional() @Inject(DOCUMENT) private _doc: any,
              @Optional() @Inject(TRI_DRAWER_CONTAINER) public _container?: TriDrawerContainer) {

    this.openedChange.subscribe((opened: boolean) => {
      if (opened) {
        if (this._doc) {
          this._elementFocusedBeforeDrawerWasOpened = this._doc.activeElement as HTMLElement;
        }

        this._takeFocus();
      } else if (this._isFocusWithinDrawer()) {
        this._restoreFocus();
      }
    });

    /**
     * Listen to `keydown` events outside the zone so that change detection is not run every
     * time a key is pressed. Instead we re-enter the zone only if the `ESC` key is pressed
     * and we don't have close disabled.
     */
    this._ngZone.runOutsideAngular(() => {
      (fromEvent(this._elementRef.nativeElement, 'keydown') as Observable<KeyboardEvent>).pipe(
        filter(event => {
          return event.keyCode === ESCAPE && !this.disableClose && !hasModifierKey(event);
        }),
        takeUntil(this._destroyed)
      ).subscribe(event => this._ngZone.run(() => {
        this.close();
        event.stopPropagation();
        event.preventDefault();
      }));
    });

    // We need a Subject with distinctUntilChanged, because the `done` event
    // fires twice on some browsers. See https://github.com/angular/angular/issues/24084
    this._animationEnd.pipe(distinctUntilChanged((x, y) => {
      return x.fromState === y.fromState && x.toState === y.toState;
    })).subscribe((event: AnimationEvent) => {
      const {fromState, toState} = event;

      if ((toState.indexOf('open') === 0 && fromState === 'void') ||
        (toState === 'void' && fromState.indexOf('open') === 0)) {
        this.openedChange.emit(this._opened);
      }
    });
  }

  private _position: 'start' | 'end' = 'start';

  /** The side that the drawer is attached to. */
  @Input()
  get position(): 'start' | 'end' {
    return this._position;
  }

  set position(value: 'start' | 'end') {
    // Make sure we have a valid value.
    value = value === 'end' ? 'end' : 'start';
    if (value != this._position) {
      this._position = value;
      this.onPositionChanged.emit();
    }
  }

  private _mode: TriDrawerMode = 'over';

  /** Mode of the drawer; one of 'over', 'push' or 'side'. */
  @Input()
  get mode(): TriDrawerMode {
    return this._mode;
  }

  set mode(value: TriDrawerMode) {
    this._mode = value;
    this._updateFocusTrapState();
    this._modeChanged.next();
  }

  private _disableClose: boolean = false;

  /** Whether the drawer can be closed with the escape key or by clicking on the backdrop. */
  @Input()
  get disableClose(): boolean {
    return this._disableClose;
  }

  set disableClose(value: boolean) {
    this._disableClose = coerceBooleanProperty(value);
  }

  private _autoFocus: AutoFocusTarget | string | boolean | undefined;

  /**
   * Whether the drawer should focus the first focusable element automatically when opened.
   * Defaults to false in when `mode` is set to `side`, otherwise defaults to `true`. If explicitly
   * enabled, focus will be moved into the sidenav in `side` mode as well.
   * @breaking-change 14.0.0 Remove boolean option from autoFocus. Use string or AutoFocusTarget
   * instead.
   */
  @Input()
  get autoFocus(): AutoFocusTarget | string | boolean {
    const value = this._autoFocus;

    // Note that usually we don't allow autoFocus to be set to `first-tabbable` in `side` mode,
    // because we don't know how the sidenav is being used, but in some cases it still makes
    // sense to do it. The consumer can explicitly set `autoFocus`.
    if (value == null) {
      if (this.mode === 'side') {
        return 'dialog';
      } else {
        return 'first-tabbable';
      }
    }
    return value;
  }

  set autoFocus(value: AutoFocusTarget | string | boolean) {
    if (value === 'true' || value === 'false') {
      value = coerceBooleanProperty(value);
    }
    this._autoFocus = value;
  }

  private _opened: boolean = false;

  /**
   * Whether the drawer is opened. We overload this because we trigger an event when it
   * starts or end.
   */
  @Input()
  get opened(): boolean {
    return this._opened;
  }

  set opened(value: boolean) {
    this.toggle(coerceBooleanProperty(value));
  }

  ngAfterContentInit() {
    this._focusTrap = this._focusTrapFactory.create(this._elementRef.nativeElement);
    this._updateFocusTrapState();
  }

  ngAfterContentChecked() {
    // Enable the animations after the lifecycle hooks have run, in order to avoid animating
    // drawers that are open by default. When we're on the server, we shouldn't enable the
    // animations, because we don't want the drawer to animate the first time the user sees
    // the page.
    if (this._platform.isBrowser) {
      this._enableAnimations = true;
    }
  }

  ngOnDestroy() {
    if (this._focusTrap) {
      this._focusTrap.destroy();
    }

    this._animationStarted.complete();
    this._animationEnd.complete();
    this._modeChanged.complete();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Open the drawer.
   * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
   * Used for focus management after the sidenav is closed.
   */
  open(openedVia?: FocusOrigin): Promise<TriDrawerToggleResult> {
    return this.toggle(true, openedVia);
  }

  /** Close the drawer. */
  close(): Promise<TriDrawerToggleResult> {
    return this.toggle(false);
  }

  /** Closes the drawer with context that the backdrop was clicked. */
  _closeViaBackdropClick(): Promise<TriDrawerToggleResult> {
    // If the drawer is closed upon a backdrop click, we always want to restore focus. We
    // don't need to check whether focus is currently in the drawer, as clicking on the
    // backdrop causes blurring of the active element.
    return this._setOpen(/* isOpen */ false, /* restoreFocus */ true);
  }

  /**
   * Toggle this drawer.
   * @param isOpen Whether the drawer should be open.
   * @param openedVia Whether the drawer was opened by a key press, mouse click or programmatically.
   * Used for focus management after the sidenav is closed.
   */
  toggle(isOpen: boolean = !this.opened, openedVia?: FocusOrigin)
    : Promise<TriDrawerToggleResult> {
    // If the focus is currently inside the drawer content and we are closing the drawer,
    // restore the focus to the initially focused element (when the drawer opened).
    return this._setOpen(
      isOpen, /* restoreFocus */ !isOpen && this._isFocusWithinDrawer(), openedVia);
  }

  _getWidth(): number {
    return this._elementRef.nativeElement ? (this._elementRef.nativeElement.offsetWidth || 0) : 0;
  }

  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('@transform.start', ['$event'])
  _animationStartListener(event: AnimationEvent) {
    this._animationStarted.next(event);
  }

  // tslint:disable-next-line:no-host-decorator-in-concrete
  @HostListener('@transform.done', ['$event'])
  _animationDoneListener(event: AnimationEvent) {
    this._animationEnd.next(event);
  }

  /**
   * Focuses the provided element. If the element is not focusable, it will add a tabIndex
   * attribute to forcefully focus it. The attribute is removed after focus is moved.
   * @param element The element to focus.
   */
  private _forceFocus(element: HTMLElement, options?: FocusOptions) {
    if (!this._interactivityChecker.isFocusable(element)) {
      element.tabIndex = -1;
      // The tabindex attribute should be removed to avoid navigating to that element again
      this._ngZone.runOutsideAngular(() => {
        element.addEventListener('blur', () => element.removeAttribute('tabindex'));
        element.addEventListener('mousedown', () => element.removeAttribute('tabindex'));
      });
    }
    element.focus(options);
  }

  /**
   * Focuses the first element that matches the given selector within the focus trap.
   * @param selector The CSS selector for the element to set focus to.
   */
  private _focusByCssSelector(selector: string, options?: FocusOptions) {
    const elementToFocus =
          this._elementRef.nativeElement.querySelector(selector) as HTMLElement | null;
    if (elementToFocus) {
      this._forceFocus(elementToFocus, options);
    }
  }

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritten.
  // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.

  /**
   * Moves focus into the drawer. Note that this works even if
   * the focus trap is disabled in `side` mode.
   */
  private _takeFocus() {
    if (!this._focusTrap) {
      return;
    }

    const element = this._elementRef.nativeElement;

    // When autoFocus is not on the sidenav, if the element cannot be focused or does
    // not exist, focus the sidenav itself so the keyboard navigation still works.
    // We need to check that `focus` is a function due to Universal.
    switch (this.autoFocus) {
      case false:
      case 'dialog':
        return;
      case true:
      case 'first-tabbable':
        this._focusTrap.focusInitialElementWhenReady().then(hasMovedFocus => {
          if (!hasMovedFocus && typeof this._elementRef.nativeElement.focus === 'function') {
            element.focus();
          }
        });
        break;
      case 'first-heading':
        this._focusByCssSelector('h1, h2, h3, h4, h5, h6, [role="heading"]');
        break;
      default:
        this._focusByCssSelector(this.autoFocus!);
        break;
    }
  }

  // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
  // In Ivy the `host` bindings will be merged when this class is extended, whereas in
  // ViewEngine they're overwritten.
  // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.

  /**
   * Restores focus to the element that was originally focused when the drawer opened.
   * If no element was focused at that time, the focus will be restored to the drawer.
   */
  private _restoreFocus() {
    if (this.autoFocus === 'dialog') {
      return;
    }

    // Note that we don't check via `instanceof HTMLElement` so that we can cover SVGs as well.
    if (this._elementFocusedBeforeDrawerWasOpened) {
      this._focusMonitor.focusVia(this._elementFocusedBeforeDrawerWasOpened, this._openedVia);
    } else {
      this._elementRef.nativeElement.blur();
    }

    this._elementFocusedBeforeDrawerWasOpened = null;
    this._openedVia                           = null;
  }

  /** Whether focus is currently within the drawer. */
  private _isFocusWithinDrawer(): boolean {
    const activeEl = this._doc?.activeElement;
    return !!activeEl && this._elementRef.nativeElement.contains(activeEl);
  }

  /**
   * Toggles the opened state of the drawer.
   * @param isOpen Whether the drawer should open or close.
   * @param restoreFocus Whether focus should be restored on close.
   * @param openedVia Focus origin that can be optionally set when opening a drawer. The
   *   origin will be used later when focus is restored on drawer close.
   */
  private _setOpen(isOpen: boolean, restoreFocus: boolean, openedVia: FocusOrigin = 'program')
    : Promise<TriDrawerToggleResult> {
    this._opened = isOpen;

    if (isOpen) {
      this._animationState = this._enableAnimations ? 'open' : 'open-instant';
      this._openedVia      = openedVia;
    } else {
      this._animationState = 'void';
      if (restoreFocus) {
        this._restoreFocus();
      }
    }

    this._updateFocusTrapState();

    return new Promise<TriDrawerToggleResult>(resolve => {
      this.openedChange.pipe(take(1)).subscribe(open => resolve(open ? 'open' : 'close'));
    });
  }

  /** Updates the enabled state of the focus trap. */
  private _updateFocusTrapState() {
    if (this._focusTrap) {
      // The focus trap is only enabled when the drawer is open in any mode other than side.
      this._focusTrap.enabled = this.opened && this.mode !== 'side';
    }
  }
}

