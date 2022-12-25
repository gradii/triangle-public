/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DragAndDropContext } from './context-types';

import { DragAndDropService } from './drag-and-drop.service';

/**
 * @hidden
 */
@Directive({
  selector: '[triDropTarget]'
})
export class DropTargetDirective implements OnInit, OnDestroy {
  @Input() context: DragAndDropContext = <DragAndDropContext>{};

  @Output() enter: EventEmitter<any> = new EventEmitter<any>();
  @Output() leave: EventEmitter<any> = new EventEmitter<any>();
  @Output() drop: EventEmitter<any> = new EventEmitter<any>();

  private subscriptions: Subscription = new Subscription();

  constructor(
    public element: ElementRef,
    private service: DragAndDropService
  ) {
  }

  ngOnInit(): void {
    this.service.add(this);

    const changes = this.service.changes.pipe(filter(({target}) => target === this));

    this.subscriptions.add(
      changes.pipe(filter(({type}) => type === 'leave'))
        .subscribe(e => {
          this.leave.next(this.eventArgs(e));
        })
    );

    this.subscriptions.add(
      changes.pipe(filter(({type}) => type === 'enter'))
        .subscribe(e => {
          this.enter.next(this.eventArgs(e));
        })
    );

    this.subscriptions.add(
      changes.pipe(filter(({type}) => type === 'drop'))
        .subscribe(e => {
          this.drop.next(this.eventArgs(e));
        })
    );
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private eventArgs(e: any): Object {
    return {
      target: this,
      mouseEvent: e.mouseEvent,
      draggable: e.draggable
    };
  }
}
