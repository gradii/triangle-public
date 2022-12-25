/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  animate, AnimationTriggerMetadata, keyframes, state, style, transition, trigger
} from '@angular/animations';
import { FocusMonitor } from '@angular/cdk/a11y';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, NgZone, OnDestroy,
  ViewContainerRef, ViewEncapsulation
} from '@angular/core';
import { _TriTooltipComponentBase, TriggerType } from '@gradii/triangle/tooltip';
import { fromEvent as observableFromEvent, merge, Observable, Subscription } from 'rxjs';
import { filter, tap } from 'rxjs/operators';


export const popoverAnimation: AnimationTriggerMetadata = trigger('popoverAnimation', [
  state('initial, void, hidden', style({opacity: 0, transform: 'scale(0)'})),
  state('visible', style({transform: 'scale(1)'})),
  transition('* => visible', animate('150ms cubic-bezier(0, 0, 0.2, 1)', keyframes([
    style({opacity: 0, transform: 'scale(0)', offset: 0}),
    style({opacity: 0.5, transform: 'scale(0.99)', offset: 0.5}),
    style({opacity: 1, transform: 'scale(1)', offset: 1})
  ]))),
  transition('* => hidden', animate('100ms cubic-bezier(0, 0, 0.2, 1)', style({opacity: 0}))),
]);


@Component({
  selector       : 'tri-popover',
  encapsulation  : ViewEncapsulation.None,
  animations     : [popoverAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <div class="tri-popover-content"
         [ngClass]="tooltipClass"
         [class.tri-popover-handset]="(_isHandset | async)?.matches"
         [@popoverAnimation]="_visibility"
         (@popoverAnimation.start)="_animationStart()"
         (@popoverAnimation.done)="_animationDone($event)">
      <div class="tri-popover-arrow">
      </div>
      <div class="tri-popover-inner">
        <div *ngIf="title" class="tri-popover-title">{{title}}</div>
        <div class="tri-popover-inner-content">
          <ng-template [stringTemplateOutlet]="content"
                       [stringTemplateOutletContext]="tooltipContext">
            {{content}}
          </ng-template>
        </div>
      </div>
    </div>`,
  styleUrls      : ['../style/popover.scss'],
  host           : {
    'class': 'tri-popover'
  },
  styles         : [
    `:host {
      position : relative;
      margin   : 1px;
    }`
  ]
})
export class PopoverComponent extends _TriTooltipComponentBase implements OnDestroy {

  _isHandset: Observable<BreakpointState> = this._breakpointObserver.observe(Breakpoints.Handset);

  protected _subscriptions: Subscription[] = [];

  @Input()
  title: string;

  constructor(
    protected _elementRef: ElementRef,
    protected _ngZone: NgZone,
    protected _focusMonitor: FocusMonitor,
    protected _breakpointObserver: BreakpointObserver,
    protected _viewContainerRef: ViewContainerRef) {

    super();

    _ngZone.runOutsideAngular(() => {
      this._subscriptions.push(
        merge(
          observableFromEvent(_elementRef.nativeElement, 'mousemove'),
          _focusMonitor.monitor(_elementRef).pipe(filter((origin) => !!origin))
        ).pipe(
          tap(() => {
            if (this._hideTimeoutId) {
              _ngZone.run(() => {
                this.show(0);
              });
              this._hideTimeoutId = undefined;
            }
          })
        ).subscribe()
      );
    });

    this._subscriptions.push(
      observableFromEvent(_elementRef.nativeElement, 'mouseleave')
        .pipe(
          tap(() => {
            if (this.config.triggerType === TriggerType.HOVER) {
              this.hide(this.config.hideDelay || 0);
            }
          })
        ).subscribe()
    );
  }

  override _handleBodyInteraction(event?: MouseEvent): void {
    if (this._elementRef.nativeElement.contains(event?.target)) {
      return;
    }
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }

  override ngOnDestroy() {
    clearTimeout(this._showTimeoutId);
    clearTimeout(this._hideTimeoutId);
    if (this._subscriptions) {
      this._subscriptions.forEach(it => it.unsubscribe());
    }
    this._onHide.complete();
  }
}
