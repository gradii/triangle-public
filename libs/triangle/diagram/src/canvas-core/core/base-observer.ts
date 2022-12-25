/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive } from '@angular/core';
import { Toolkit } from '../toolkit';

export interface BaseEvent {
  firing?: boolean;
  stopPropagation?: () => any;
}

export interface BaseEventProxy extends BaseEvent {
  function: string | number | symbol;
}

/**
 * Listeners are always in the form of an object that contains methods that take events
 */
export interface BaseListener {
  /**
   * Generic event that fires before a specific event was fired
   */
  eventWillFire?: (event: BaseEvent & { function?: string }) => void;

  /**
   * Generic event that fires after a specific event was fired (even if it was consumed)
   */
  eventDidFire?: (event: BaseEvent & { function?: string }) => void;
  // /**
  //  * Type for other events that will fire
  //  */
  [key: string]: (event?: any) => any;
}

export interface ListenerHandle {
  /**
   * Used to degister the listener
   */
  deregister: () => any;
  /**
   * Original ID of the listener
   */
  id: string;

  /**
   * Original Listener
   */
  listener: BaseListener;
}

/**
 * Base observer pattern class for working with listeners
 */
@Directive()
export class BaseObserver<L extends BaseListener = BaseListener> {
  protected listeners: { [id: string]: L } = {};

  // constructor() {
  //   this.listeners = {};
  // }

  fireEvent<K extends keyof L>(event: BaseEvent | any, k: string | number | symbol) {
    event = {
      firing         : true,
      stopPropagation: () => {
        event.firing = false;
      },
      ...event
    } as BaseEvent;

    // fire pre
    this.fireEventInternal(true, 'eventWillFire', {
      ...event,
      function: k
    });

    // fire main event
    this.fireEventInternal(false, k as string, event as BaseEvent);

    // fire post
    this.fireEventInternal(true, 'eventDidFire', {
      ...event,
      function: k
    });
  }

  iterateListeners(cb: (listener: L) => any) {
    for (const id in this.listeners) {
      const res = cb(this.listeners[id]);
      // cancel itteration on false
      if (res === false) {
        return;
      }
    }
  }

  getListenerHandle(listener: L): ListenerHandle {
    for (const id in this.listeners) {
      if (this.listeners[id] === listener) {
        return {
          id        : id,
          listener  : listener,
          deregister: () => {
            delete this.listeners[id];
          }
        };
      }
    }

    return undefined;
  }

  registerListener(listener: L): ListenerHandle {
    const id           = Toolkit.UID();
    this.listeners[id] = listener;
    return {
      id        : id,
      listener  : listener,
      deregister: () => {
        delete this.listeners[id];
      }
    };
  }

  deregisterListener(listener: L | ListenerHandle) {
    if (typeof listener === 'object') {
      (listener as ListenerHandle).deregister();
      return true;
    }
    const handle = this.getListenerHandle(listener);
    if (handle) {
      handle.deregister();
      return true;
    }
    return false;
  }

  private fireEventInternal(fire: boolean, k: string, event: BaseEvent | BaseEventProxy) {
    this.iterateListeners((listener: any) => {
      // returning false here will instruct itteration to stop
      if (!fire && !event.firing) {
        return false;
      }
      // fire selected listener
      // @ts-ignore
      if (listener[k]) {
        // @ts-ignore
        listener[k](event as BaseEvent);
      }

      return undefined;
    });
  }
}
