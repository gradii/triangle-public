/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter, HostListener,
  Input, NgZone,
  OnDestroy,
  Output
} from '@angular/core';

@Directive({
  selector: '[triDroppable]'
})
export class Droppable implements AfterViewInit, OnDestroy {

  @Input('triDroppable') scope: string | string[];

  @Input() pDroppableDisabled: boolean;

  @Input() dropEffect: DataTransfer['dropEffect'];

  @Output() onDragEnter: EventEmitter<any> = new EventEmitter();

  @Output() onDragLeave: EventEmitter<any> = new EventEmitter();

  @Output() onDrop: EventEmitter<any> = new EventEmitter();

  constructor(public el: ElementRef, public zone: NgZone) {
  }

  dragOverListener: any;

  ngAfterViewInit() {
    if (!this.pDroppableDisabled) {
      this.bindDragOverListener();
    }
  }

  bindDragOverListener() {
    if (!this.dragOverListener) {
      this.zone.runOutsideAngular(() => {
        this.dragOverListener = this.dragOver.bind(this);
        this.el.nativeElement.addEventListener('dragover', this.dragOverListener);
      });
    }
  }

  unbindDragOverListener() {
    if (this.dragOverListener) {
      this.zone.runOutsideAngular(() => {
        this.el.nativeElement.removeEventListener('dragover', this.dragOverListener);
        this.dragOverListener = null;
      });
    }
  }

  dragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('drop', ['$event'])
  drop(event: DragEvent) {
    if (this.allowDrop(event)) {
      event.preventDefault();
      this.onDrop.emit(event);
    }
  }

  @HostListener('dragenter', ['$event'])
  dragEnter(event: DragEvent) {
    event.preventDefault();

    if (this.dropEffect) {
      event.dataTransfer.dropEffect = this.dropEffect;
    }

    this.onDragEnter.emit(event);
  }

  @HostListener('dragleave', ['$event'])
  dragLeave(event: DragEvent) {
    event.preventDefault();

    this.onDragLeave.emit(event);
  }

  allowDrop(event: DragEvent): boolean {
    const dragScope = event.dataTransfer.getData('text');
    if (typeof (this.scope) == 'string' && dragScope == this.scope) {
      return true;
    } else if (this.scope instanceof Array) {
      for (let j = 0; j < this.scope.length; j++) {
        if (dragScope == this.scope[j]) {
          return true;
        }
      }
    }
    return false;
  }

  ngOnDestroy() {
    this.unbindDragOverListener();
  }
}
