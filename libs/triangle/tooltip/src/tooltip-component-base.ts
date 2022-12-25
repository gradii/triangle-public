/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { AnimationEvent } from '@angular/animations';
import {
  Directive,
  OnDestroy,
  TemplateRef,
  ɵmarkDirty
} from '@angular/core';
import {
  Observable,
  Subject
} from 'rxjs';
import { TriggerType } from './tooltip.common';
import { TooltipVisibility } from './tooltip.interface';


@Directive()
export abstract class _TriTooltipComponentBase implements OnDestroy {
  /** Message to display in the tooltip */
  content: string | TemplateRef<any>;

  config: {
    triggerType?: TriggerType,
    showDelay?: number,
    hideDelay?: number
  } = {};

  /** Classes to be added to the tooltip. Supports the same syntax as `ngClass`. */
  tooltipClass: string | string[] | Set<string> | { [key: string]: any };

  tooltipContext: { [key: string]: any };

  /** The timeout ID of any current timer set to show the tooltip */
  _showTimeoutId: number | undefined;

  /** The timeout ID of any current timer set to hide the tooltip */
  _hideTimeoutId: number | undefined;

  /** Property watched by the animation framework to show or hide the tooltip */
  _visibility: TooltipVisibility = 'initial';

  /** Whether interactions on the page should close the tooltip */
  protected _closeOnInteraction: boolean = false;

  /** Subject for notifying that the tooltip has been hidden from the view */
  protected readonly _onHide: Subject<void> = new Subject();

  protected constructor() {
  }

  /**
   * Shows the tooltip with an animation originating from the provided origin
   * @param delay Amount of milliseconds to the delay showing the tooltip.
   */
  show(delay: number): void {
    // Cancel the delayed hide if it is scheduled
    clearTimeout(this._hideTimeoutId);

    // Body interactions should cancel the tooltip if there is a delay in showing.
    this._closeOnInteraction = true;
    // @ts-ignore
    this._showTimeoutId      = setTimeout(() => {
      this._visibility    = 'visible';
      this._showTimeoutId = undefined;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
    }, delay);
  }

  /**
   * Begins the animation to hide the tooltip after the provided delay in ms.
   * @param delay Amount of milliseconds to delay showing the tooltip.
   */
  hide(delay: number): void {
    // Cancel the delayed show if it is scheduled
    clearTimeout(this._showTimeoutId);

    // @ts-ignore
    this._hideTimeoutId = setTimeout(() => {
      this._visibility    = 'hidden';
      this._hideTimeoutId = undefined;

      // Mark for check so if any parent component has set the
      // ChangeDetectionStrategy to OnPush it will be checked anyways
      this._markForCheck();
    }, delay);
  }

  /** Returns an observable that notifies when the tooltip has been hidden from view. */
  afterHidden(): Observable<void> {
    return this._onHide;
  }

  /** Whether the tooltip is being displayed. */
  isVisible(): boolean {
    return this._visibility === 'visible';
  }

  ngOnDestroy() {
    clearTimeout(this._showTimeoutId);
    clearTimeout(this._hideTimeoutId);
    this._onHide.complete();
  }

  _animationStart() {
    this._closeOnInteraction = false;
  }

  _animationDone(event: AnimationEvent): void {
    const toState = event.toState as TooltipVisibility;

    if (toState === 'hidden' && !this.isVisible()) {
      this._onHide.next();
    }

    if (toState === 'visible' || toState === 'hidden') {
      this._closeOnInteraction = true;
    }
  }

  _handleBodyInteraction(event?: MouseEvent): void {
    if (this._closeOnInteraction) {
      this.hide(0);
    }
  }

  /**
   * Marks that the tooltip needs to be checked in the next change detection run.
   * Mainly used for rendering the initial text before positioning a tooltip, which
   * can be problematic in components with OnPush change detection.
   */
  _markForCheck(): void {
    ɵmarkDirty(this);
  }
}
