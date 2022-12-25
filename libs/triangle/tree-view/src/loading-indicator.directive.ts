/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { delay, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { ExpandStateService } from './expand-state.service';
import { LoadingNotificationService } from './loading-notification.service';

@Directive({
  selector: '[triTreeViewLoading]',
  host    : {
    '[class.tri-i-loading]': 'loading'
  }
})
export class LoadingIndicatorDirective implements OnInit, OnDestroy {
  @Input('triTreeViewLoading')
  uid: string;
  subscription: any;

  constructor(private expandService: ExpandStateService,
              private loadingService: LoadingNotificationService,
              private cdr: ChangeDetectorRef) {
    this._loading = false;
  }

  _loading: boolean;

  get loading(): boolean {
    return this._loading;
  }

  set loading(value: boolean) {
    this._loading = value;
    this.cdr.markForCheck();
  }

  ngOnInit() {
    const loadingNotifications = this.loadingService
      .changes
      .pipe(
        filter(uid => uid === this.uid)
      );

    this.subscription          = this.expandService
      .changes
      .pipe(
        filter(({uid}) => uid === this.uid),
        tap(({expand}) => {
          if (!expand && this.loading) {
            this.loading = false;
          }
        }),
        filter(({expand}) => expand),
        switchMap(x => of(x)
          .pipe(
            delay(100),
            takeUntil(loadingNotifications)
          )
        )
      )
      .subscribe(() => this.loading = true);

    this.subscription.add(
      loadingNotifications.subscribe(() => this.loading = false)
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
