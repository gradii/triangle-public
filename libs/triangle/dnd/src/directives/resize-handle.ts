/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive, ElementRef, Inject, InjectionToken, OnDestroy, Optional, SkipSelf,
} from '@angular/core';
import { Subject } from 'rxjs';
import { assertElementNode } from './assertions';

declare const ngDevMode: object | null;

/**
 * Injection token that can be used to reference instances of `TriDragHandle`. It serves as
 * alternative token to the actual `TriDragHandle` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_RESIZE_HANDLE = new InjectionToken<TriResizeHandle>('TriResizeHandle');

/** Handle that can be used to drag a TriDrag instance. */
@Directive({
  selector : '[TriResizeHandle]',
  host     : {
    'class': 'tri-resize-handle'
  },
  providers: [{provide: TRI_RESIZE_HANDLE, useExisting: TriResizeHandle}],
})
export class TriResizeHandle implements OnDestroy {

  constructor(
    public element: ElementRef<HTMLElement>) {

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'triDragHandle');
    }

  }

  ngOnDestroy() {
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
