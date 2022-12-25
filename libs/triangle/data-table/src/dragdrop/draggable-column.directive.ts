/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Host,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';
import { of, Subscription } from 'rxjs';
import { delay, filter, map, switchMap, switchMapTo, takeUntil, tap } from 'rxjs/operators';
import { isFocusable, matchesNodeName } from '../helper/dom-queries';
import { DraggableDirective } from '../table-shared/draggable.directive';

import { and, not, or } from '../utils';
import { DragAndDropContext } from './context-types';


import { DragAndDropService } from './drag-and-drop.service';
import { DragHintService } from './drag-hint.service';
import { DropCueService } from './drop-cue.service';

const preventOnDblClick = release => mouseDown =>
  of(mouseDown).pipe(delay(150), takeUntil(release));

const hasClass = className => el => new RegExp(`(^| )${className}( |$)`).test(el.className);
const isDeleteButton = or(hasClass('k-i-group-delete'), hasClass('k-button-icon'));
const isSortIcon = or(hasClass('k-i-sort-asc-sm'), hasClass('k-i-sort-desc-sm'));
const skipButtons = and(
  not(isDeleteButton),
  not(isSortIcon),
  not(isFocusable),
  not(matchesNodeName('label'))
);

const elementUnderCursor = ({clientX, clientY}) =>
  document.elementFromPoint(clientX, clientY);

const hideThenShow = (element, cont) => {
  element.style.display = 'none';

  const result = cont();

  element.style.display = 'block';

  return result;
};

/**
 * @hidden
 */
@Directive({
  selector: '[triDraggableColumn]'
})
export class DraggableColumnDirective implements OnInit, OnDestroy {
  @Input() context: DragAndDropContext = <DragAndDropContext>{};
  @Output() drag: EventEmitter<any> = new EventEmitter<any>();
  private subscriptions: Subscription = new Subscription();
  private enabled: boolean;

  constructor(
    @Host() public draggable: DraggableDirective,
    public element: ElementRef,
    private zone: NgZone,
    private service: DragAndDropService,
    private hint: DragHintService,
    private cue: DropCueService,
    // private nav: NavigationService,
    private renderer: Renderer2
  ) {
  }

  @Input()
  set triDraggableColumn(enabled: boolean) {
    this.enabled = enabled;
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.zone.runOutsideAngular(() =>
        this.draggable.tri.press.pipe(
          filter(_ => this.enabled),
          filter(({originalEvent: {target}}) => skipButtons(target)),
          tap((e) => {
            const originalEvent = e.originalEvent;
            if (!e.isTouch) {
              originalEvent.preventDefault();
            }
            // this.nav.navigateTo(originalEvent.target);
          }),
          switchMap(preventOnDblClick(this.draggable.tri.release)),
          tap(down => {
            this.hint.create(down, this.element.nativeElement, this.context.hint);
            this.cue.create();
          }),
          switchMap(down =>
            this.draggable.tri.drag.pipe(
              tap((e) => {
                if (e.isTouch) {
                  e.originalEvent.preventDefault();
                }
              }),
              tap(<any>this.hint.attach()),
              tap(<any>this.cue.attach()),
              takeUntil(this.draggable.tri.release),
              map(move => ({move, down}))
            )
          ),
          tap(this.performDrag.bind(this)),
          switchMapTo(this.draggable.tri.release)
        ).subscribe(this.drop.bind(this))
      )
    );

    if (this.element) {
      const element = this.element.nativeElement;
      this.renderer.setStyle(element, 'touch-action', 'none');
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private drop(upEvent: any): void {
    this.hint.remove();
    this.cue.remove();
    this.service.notifyDrop(this, upEvent);
  }

  private performDrag({move}: any): void {
    this.hint.move(move);
    const cursorElement = this.elementUnderCursor(move);

    if (cursorElement) {
      this.service.notifyDrag(this, cursorElement, move);
    }

    this.drag.emit({
      draggable: this,
      mouseEvent: move
    });
  }

  private elementUnderCursor(mouseEvent: any): any {
    this.hint.hide();

    let target = elementUnderCursor(mouseEvent);

    if (target && /k-grouping-dropclue/.test(target.className)) {
      target = hideThenShow(target, elementUnderCursor.bind(this, mouseEvent));
    }

    this.hint.show();

    return target;
  }
}
