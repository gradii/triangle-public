/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import * as _ from '@gradii/nanofn';
import { CanvasEngine } from '../canvas-engine';
import { BaseEvent, BaseListener, BaseObserver } from '../core/base-observer';
import { State } from './state';

export interface StateMachineListener extends BaseListener {
  stateChanged?: (event: BaseEvent & { newState: State }) => any;
}

export class StateMachine extends BaseObserver<StateMachineListener> {
  protected currentState: State;
  protected stateStack: State[];
  protected engine: CanvasEngine;

  constructor(engine: CanvasEngine) {
    super();
    this.engine     = engine;
    this.stateStack = [];
  }

  getCurrentState() {
    return this.currentState;
  }

  pushState(state: State) {
    this.stateStack.push(state);
    this.setState(state);
  }

  popState() {
    this.stateStack.pop();
    this.setState(this.stateStack[this.stateStack.length - 1]);
  }

  setState(state: State) {
    state.setEngine(this.engine);

    // if no state object, get the initial state
    if (this.currentState) {
      this.currentState.deactivated(state);
    }
    const old         = this.currentState;
    this.currentState = state;
    if (this.currentState) {
      this.currentState.activated(old);
      this.fireEvent<'stateChanged'>(
        {
          // @ts-ignore
          newState: state
        },
        'stateChanged'
      );
    }
  }
}
