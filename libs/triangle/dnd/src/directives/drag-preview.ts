/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, InjectionToken, Input, TemplateRef } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriDragPreview`. It serves as
 * alternative token to the actual `TriDragPreview` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_DRAG_PREVIEW = new InjectionToken<TriDragPreview>('TriDragPreview');

/**
 * Element that will be used as a template for the preview
 * of a TriDrag when it is being dragged.
 */
@Directive({
  selector : 'ng-template[triDragPreview]',
  providers: [{provide: TRI_DRAG_PREVIEW, useExisting: TriDragPreview}],
})
export class TriDragPreview<T = any> {
  /** Context data to be added to the preview template instance. */
  @Input() data: T;

  /** Whether the preview should preserve the same size as the item that is being dragged. */
  @Input()
  get matchSize(): boolean {
    return this._matchSize;
  }

  set matchSize(value: boolean) {
    this._matchSize = coerceBooleanProperty(value);
  }

  private _matchSize = false;

  constructor(public templateRef: TemplateRef<T>) {
  }

  static ngAcceptInputType_matchSize: BooleanInput;
}
