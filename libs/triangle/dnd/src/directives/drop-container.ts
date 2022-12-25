/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, ElementRef, InjectionToken, Input } from '@angular/core';
import { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';
import { TriDropContainerGroup } from './drop-container-group';
import { TriDropListContainer } from './drop-list-container';


/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;

/**
 * Injection token that can be used to reference instances of `TriDropContainer`. It serves as
 * alternative token to the actual `TriDropContainer` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_DROP_CONTAINER = new InjectionToken<TriDropListContainer>('TriDropContainer');


@Directive()
export abstract class TriDropContainer<T = any> {
  data: T;

  public element: ElementRef<HTMLElement>;

  /**
   * Unique ID for the drop zone. Can be used as a reference
   * in the `connectedTo` of another `TriDropContainer`.
   */
  @Input()
  id: string = `tri-drop-container-${_uniqueIdCounter++}`;

  /** Keeps track of the drop lists that are currently on the page. */
  protected static _dropContainers: TriDropContainer[] = [];

  /** Reference to the underlying drop list instance. */
  _dropContainerRef: DndContainerRef<TriDropContainer>;

  /** Whether starting a dragging sequence from this container is disabled. */
  get disabled(): boolean {
    return this._disabled || (!!this._group && this._group.disabled);
  }

  set disabled(value: boolean) {
    // Usually we sync the directive and ref state right before dragging starts, in order to have
    // a single point of failure and to avoid having to use setters for everything. `disabled` is
    // a special case, because it can prevent the `beforeStarted` event from firing, which can lock
    // the user in a disabled state, so we also need to sync it as it's being set.
    this._dropContainerRef.disabled = this._disabled = coerceBooleanProperty(value);
  }

  protected _disabled: boolean;

  constructor(
    protected _group?: TriDropContainerGroup<TriDropContainer>
  ) {
    if (_group) {
      _group._items.add(this);
    }
  }

  /** Registers an items with the drop list. */
  abstract addItem(item: any): void;

  /** Removes an item from the drop list. */
  abstract removeItem(item: any): void;

}

