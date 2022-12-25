/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentRef, Injectable, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { isPresent } from '@gradii/nanofn';

/**
 * @hidden
 */
@Injectable()
export abstract class DragAndDropAssetService<T> implements OnDestroy {
  _componentRef: ComponentRef<T>;

  get componentRef(): ComponentRef<T> {
    if (!isPresent(this._componentRef)) {
      throw new Error(
        'The `initalize` method must be called before calling other service methods.');
    }
    return this._componentRef;
  }

  set componentRef(componentRef: ComponentRef<T>) {
    this._componentRef = componentRef;
  }

  get element(): HTMLElement {
    return this.componentRef.location.nativeElement;
  }

  ngOnDestroy() {
    if (!isPresent(this._componentRef)) {
      return;
    }
    this.element.parentNode.removeChild(this.element);
    this.componentRef.destroy();
    this.componentRef = null;
  }

  show() {
    this.element.style.display = '';
  }

  hide() {
    this.element.style.display = 'none';
  }

  move(left: number, top: number, offset: number = 0) {
    this.element.style.left = `${left + offset}px`;
    this.element.style.top  = `${top + offset}px`;
  }

  abstract initialize(container: ViewContainerRef,
                      template: TemplateRef<any>): void;
}
