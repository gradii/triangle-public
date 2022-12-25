/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TriAccessChecker } from '../services/access-checker.service';

@Directive({
  selector: '[triIsGranted]',
  inputs: [
    'isGranted:triIsGranted'
  ]
})
export class TriIsGrantedDirective implements OnDestroy {

  private destroy$ = new Subject<void>();

  private hasView = false;

  constructor(private templateRef: TemplateRef<any>,
              private viewContainer: ViewContainerRef,
              private accessChecker: TriAccessChecker) {
  }

  set isGranted([permission, resource]: [string, string]) {

    this.accessChecker.isGranted(permission, resource)
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe((can: boolean) => {
        if (can && !this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef);
          this.hasView = true;
        } else if (!can && this.hasView) {
          this.viewContainer.clear();
          this.hasView = false;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
