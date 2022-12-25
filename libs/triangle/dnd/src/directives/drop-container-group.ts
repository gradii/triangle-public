/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, InjectionToken, Input, OnDestroy } from '@angular/core';

/**
 * Injection token that can be used to reference instances of `TriDropContainerGroup`. It serves as
 * alternative token to the actual `TriDropContainerGroup` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_DROP_CONTAINER_GROUP =
  new InjectionToken<TriDropContainerGroup<unknown>>('TriDropContainerGroup');

/**
 * Declaratively connects sibling `triDropContainer` instances together. All of the `triDropContainer`
 * elements that are placed inside a `triDropContainerGroup` will be connected to each other
 * automatically. Can be used as an alternative to the `triDropContainerConnectedTo` input
 * from `triDropContainer`.
 */
@Directive({
  selector : '[triDropContainerGroup]',
  exportAs : 'triDropContainerGroup',
  providers: [{provide: TRI_DROP_CONTAINER_GROUP, useExisting: TriDropContainerGroup}],
})
export class TriDropContainerGroup<T> implements OnDestroy {
  /** Drop lists registered inside the group. */
  readonly _items = new Set<T>();

  /** Whether starting a dragging sequence from inside this group is disabled. */
  @Input('triDropContainerGroupDisabled')
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _disabled = false;

  ngOnDestroy() {
    this._items.clear();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
