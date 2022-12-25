/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { PointModel } from '../../entities/link/point-model';

@Component({
  selector: 'svg:g[tri-triangle-link-point-widget]',
  template: `
    <svg:circle
      [attr.cx]="point.getPosition().x"
      [attr.cy]="point.getPosition().y"
      [attr.r]="5"
      [attr.fill]="selected || point.isSelected() ? colorSelected : color"
    />
    <svg:circle #circle class="pointTop point"
                [attr.data-id]="point.getID()"
                [attr.data-linkid]="point.getLink().getID()"
                [attr.cx]="point.getPosition().x"
                [attr.cy]="point.getPosition().y"
                [attr.r]="15"
                [attr.opacity]="0"
    />
  `,
  styles  : [
    `
      .pointTop {
        pointer-events : all;
      }
    `
  ]
})
export class TriLinkPointWidget implements AfterViewInit, OnDestroy {

  @Input() point: PointModel;
  @Input() color?: string;
  @Input() colorSelected: string;

  @Input() selected: boolean;

  @ViewChild('circle', {read: ElementRef})
  circleRef: ElementRef<SVGCircleElement>;

  private destroy$ = new Subject();

  constructor(private _ngZone: NgZone) {
  }

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      fromEvent(this.circleRef.nativeElement, 'mouseenter', {capture: true}).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this._enterHandler();
        })
      ).subscribe();

      fromEvent(this.circleRef.nativeElement, 'mouseleave', {capture: true}).pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this._leaveHandler();
        })
      ).subscribe();
    });

    // this.circleRef.nativeElement.addEventListener('mouseenter', this._enterHandler, true);
    //
    // this.circleRef.nativeElement.addEventListener('mouseleave', this._leaveHandler, true);
    // });
  }

  // ngDestroy() {
  //   const _element = this.circleRef.nativeElement;
  //   _element.removeEventListener('mouseenter', this._enterHandler, true);
  //
  //   _element.removeEventListener('mouseleave', this._leaveHandler, true);
  // }

  ngOnDestroy(): void {
    this.destroy$.complete();
  }

  private _enterHandler() {
    this.selected = true;
  }

  private _leaveHandler() {
    this.selected = false;
  }
}
