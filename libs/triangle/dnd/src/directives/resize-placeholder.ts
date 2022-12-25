/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Directive, InjectionToken, Input, TemplateRef } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriDragPlaceholder`. It serves as
 * alternative token to the actual `TriDragPlaceholder` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_RESIZE_PLACEHOLDER = new InjectionToken<TriResizePlaceholder>('TriResizePlaceholder');

/**
 * Element that will be used as a template for the placeholder of a TriDrag when
 * it is being dragged. The placeholder is displayed in place of the element being dragged.
 */
@Directive({
  selector : 'ng-template[TriResizePlaceholder]',
  providers: [{provide: TRI_RESIZE_PLACEHOLDER, useExisting: TriResizePlaceholder}],
})
export class TriResizePlaceholder<T = any> {
  /** Context data to be added to the placeholder template instance. */
  @Input() data: T;

  constructor(public templateRef: TemplateRef<T>) {
  }
}
