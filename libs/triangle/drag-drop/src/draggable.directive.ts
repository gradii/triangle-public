/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Directive,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  NgZone
} from '@angular/core';

function matches(element: HTMLElement, selector: string): boolean {
  const p = Element.prototype;
  // @ts-ignore
  const f = p['matches'] || p.webkitMatchesSelector || p['mozMatchesSelector'] || p['msMatchesSelector'] || function (s) {
    // @ts-ignore
    return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
  };
  return f.call(element, selector);
}


@Directive({
  selector: '[triDraggable]'
})
export class Draggable implements AfterViewInit, OnDestroy {

  @Input('triDraggable') scope: string;

  @Input() dragEffect: DataTransfer['effectAllowed'];

  @Input() dragHandle: string;

  @Output() onDragStart: EventEmitter<any> = new EventEmitter();

  @Output() onDragEnd: EventEmitter<any> = new EventEmitter();

  @Output() onDrag: EventEmitter<any> = new EventEmitter();

  handle: any;

  dragListener: any;

  mouseDownListener: any;

  mouseUpListener: any;

  _pDraggableDisabled: boolean;

  constructor(public el: ElementRef, public zone: NgZone) {
  }

  @Input() get pDraggableDisabled(): boolean {
    return this._pDraggableDisabled;
  }

  set pDraggableDisabled(_pDraggableDisabled: boolean) {
    this._pDraggableDisabled = _pDraggableDisabled;

    if (this._pDraggableDisabled) {
      this.unbindMouseListeners();
    } else {
      this.el.nativeElement.draggable = true;
      this.bindMouseListeners();
    }
  }

  ngAfterViewInit() {
    if (!this.pDraggableDisabled) {
      this.el.nativeElement.draggable = true;
      this.bindMouseListeners();
    }
  }

  bindDragListener() {
    if (!this.dragListener) {
      this.zone.runOutsideAngular(() => {
        this.dragListener = this.drag.bind(this);
        this.el.nativeElement.addEventListener('drag', this.dragListener);
      });
    }
  }

  unbindDragListener() {
    if (this.dragListener) {
      this.zone.runOutsideAngular(() => {
        this.el.nativeElement.removeEventListener('drag', this.dragListener);
        this.dragListener = null;
      });
    }
  }

  bindMouseListeners() {
    if (!this.mouseDownListener && !this.mouseUpListener) {
      this.zone.runOutsideAngular(() => {
        this.mouseDownListener = this.mousedown.bind(this);
        this.mouseUpListener = this.mouseup.bind(this);
        this.el.nativeElement.addEventListener('mousedown', this.mouseDownListener);
        this.el.nativeElement.addEventListener('mouseup', this.mouseUpListener);
      });
    }
  }

  unbindMouseListeners() {
    if (this.mouseDownListener && this.mouseUpListener) {
      this.zone.runOutsideAngular(() => {
        this.el.nativeElement.removeEventListener('mousedown', this.mouseDownListener);
        this.el.nativeElement.removeEventListener('mouseup', this.mouseUpListener);
        this.mouseDownListener = null;
        this.mouseUpListener = null;
      });
    }
  }

  drag(event: DragEvent) {
    this.onDrag.emit(event);
  }

  @HostListener('dragstart', ['$event'])
  dragStart(event: DragEvent) {
    if (this.allowDrag() && !this.pDraggableDisabled) {
      if (this.dragEffect) {
        event.dataTransfer.effectAllowed = this.dragEffect;
      }
      event.dataTransfer.setData('text', this.scope);

      this.onDragStart.emit(event);

      this.bindDragListener();
    } else {
      event.preventDefault();
    }
  }

  @HostListener('dragend', ['$event'])
  dragEnd(event: DragEvent) {
    this.onDragEnd.emit(event);
    this.unbindDragListener();
  }

  mousedown(event: DragEvent) {
    this.handle = event.target;
  }

  mouseup(event: DragEvent) {
    this.handle = null;
  }

  allowDrag(): boolean {
    if (this.dragHandle && this.handle) {
      return matches(this.handle, this.dragHandle);
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.unbindDragListener();
    this.unbindMouseListeners();
  }

}
