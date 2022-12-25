/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Directive, ElementRef, Inject, InjectionToken, Input, OnDestroy, Optional, SkipSelf,
} from '@angular/core';
import { Subject } from 'rxjs';
import { TRI_DRAG_PARENT } from '../drag-parent';
import { assertElementNode } from './assertions';

declare const ngDevMode: object | null;

/**
 * Injection token that can be used to reference instances of `TriDragHandle`. It serves as
 * alternative token to the actual `TriDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_DRAG_HANDLE = new InjectionToken<TriDragHandle>('TriDragHandle');

/** Handle that can be used to drag a TriDrag instance. */
@Directive({
  selector : '[triDragHandle]',
  host     : {
    'class': 'tri-drag-handle'
  },
  providers: [{provide: TRI_DRAG_HANDLE, useExisting: TriDragHandle}],
})
export class TriDragHandle implements OnDestroy {
  /** Closest parent draggable instance. */
  _parentDrag: {} | undefined;

  /** Emits when the state of the handle has changed. */
  readonly _stateChanges = new Subject<TriDragHandle>();

  /** Whether starting to drag through this handle is disabled. */
  @Input('triDragHandleDisabled')
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._stateChanges.next(this);
  }

  private _disabled = false;

  constructor(
    public element: ElementRef<HTMLElement>,
    @Inject(TRI_DRAG_PARENT) @Optional() @SkipSelf() parentDrag?: any) {

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'triDragHandle');
    }

    this._parentDrag = parentDrag;
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
