/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { NgControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

/**
 * Begins with at least one non whitespace and ends with any number
 * of groups of at least one whitespace followed by at least one non whitespace.
 */
const NO_START_AND_END_SPACES = /^[^\s]+(\s+[^\s]+)*$/;

@Directive({
  selector: '[triTrim]'
})
export class TrimDirective implements OnInit, OnDestroy {
  private destroyed$ = new Subject<void>();

  constructor(private elementRef: ElementRef, private ngControl: NgControl) {
  }

  ngOnInit(): void {
    fromEvent(this.elementRef.nativeElement, 'focusout')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        const currentValue: string = (this.ngControl.value || '').toString();
        if (!NO_START_AND_END_SPACES.test(currentValue)) {
          this.ngControl.control.patchValue(currentValue.trim());
        }
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
  }
}
