/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef,
  Host, Inject, NgZone, OnDestroy, OnInit
} from '@angular/core';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { CanvasEngine } from '../../canvas-engine';
import { CANVAS_WIDGET, ENGINE } from '../../tokens';

@Component({
  selector       : 'canvas-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <ng-template ngFor let-layer [ngForOf]="engine.getModel().getLayers()">
      <transform-layer-widget [layer]="layer"
                              [attr.key]="layer.getID()">
      </transform-layer-widget>
    </ng-template>`,
  providers      : [
    {
      provide: CANVAS_WIDGET, useExisting: forwardRef(() => CanvasWidget)
    }
  ],
  styles         : [
    `:host {
      position : absolute;
      height   : 100%;
      width    : 100%;
    }`
  ]
})
export class CanvasWidget implements OnInit, AfterViewInit, OnDestroy {

  keyUp: any;
  keyDown: any;
  canvasListener: any;

  // @Input()
  // engine: CanvasEngine;

  action: null;
  diagramEngineListener: null;

  subject$ = new Subject();

  constructor(@Inject(ENGINE) public engine: CanvasEngine,
              public ngZone: NgZone,
              public cdRef: ChangeDetectorRef,
              @Host() protected ref: ElementRef<HTMLDivElement>) {
    cdRef.detach();
  }

  onWheel(event: UIEvent) {
    this.engine.getActionEventBus().fireAction({event});
  }

  onMouseDown(event: UIEvent) {
    this.engine.getActionEventBus().fireAction({event});
  }

  onMouseUp(event: UIEvent) {
    this.engine.getActionEventBus().fireAction({event});
  }

  onMouseMove(event: UIEvent) {
    this.engine.getActionEventBus().fireAction({event});
  }

  registerCanvas() {
    this.engine.setCanvas(this.ref.nativeElement);
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {

      fromEvent<WheelEvent>(
        this.ref.nativeElement,
        'wheel'
      ).pipe(
        takeUntil(this.subject$),
        tap((event) => {
          this.onWheel(event);
        })
      ).subscribe();

      fromEvent<WheelEvent>(
        this.ref.nativeElement,
        'mousedown'
      ).pipe(
        takeUntil(this.subject$),
        tap((event) => {
          this.onMouseDown(event);
        })
      ).subscribe();

      fromEvent<WheelEvent>(
        this.ref.nativeElement,
        'mouseup'
      ).pipe(
        takeUntil(this.subject$),
        tap((event) => {
          this.onMouseUp(event);
        })
      ).subscribe();

      fromEvent<WheelEvent>(
        this.ref.nativeElement,
        'mousemove'
      ).pipe(
        takeUntil(this.subject$),
        tap((event) => {
          this.onMouseMove(event);
        })
      ).subscribe();
    });
  }

  // move this detect changes to every typed model
  ngAfterViewInit() {
    this.cdRef.detectChanges();

    this.canvasListener = this.engine.registerListener({
      repaintCanvas: () => {
        // this.forceUpdate(); react
        this.cdRef.detectChanges();
      }
    });

    // this.keyDown = (event: MouseEvent) => {
    //   this.engine.getActionEventBus().fireAction({event});
    // };
    // this.keyUp   = (event: MouseEvent) => {
    //   this.engine.getActionEventBus().fireAction({event});
    // };

    merge(
      fromEvent<WheelEvent>(
        document,
        'keyup'
      ),
      fromEvent<WheelEvent>(
        document,
        'keydown'
      ),
    ).pipe(
      takeUntil(this.subject$),
      tap((event) => {
        this.engine.getActionEventBus().fireAction({event});
      })
    ).subscribe();

    this.registerCanvas();
  }

  ngOnDestroy(): void {
    this.subject$.complete();

    this.engine.deregisterListener(this.canvasListener);
    this.engine.setCanvas(null);
  }

}
