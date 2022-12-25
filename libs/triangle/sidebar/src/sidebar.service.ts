/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Injectable } from '@angular/core';
import { Observable, Observer, ReplaySubject, Subject } from 'rxjs';
import { publish, refCount, share } from 'rxjs/operators';
import { TriSidebarResponsiveState, TriSidebarState } from './sidebar.component';

export const getSidebarState$           = new Subject<{ tag: string, observer: Observer<TriSidebarState> }>();
export const getSidebarResponsiveState$ = new Subject<{ tag: string, observer: Observer<TriSidebarResponsiveState> }>();

/**
 * Sidebar service.
 *
 * Root module service to control the sidebar from any part of the app.
 *
 * Allows you to change sidebar state dynamically from any part of the app:
 * @stacked-example(Sidebar State, sidebar/sidebar-toggle.component)
 */
@Injectable()
export class TriSidebarService {

  private toggle$   = new Subject<{ compact: boolean, tag: string }>();
  private expand$   = new Subject<{ tag: string }>();
  private collapse$ = new Subject<{ tag: string }>();
  private compact$  = new Subject<{ tag: string }>();

  /**
   * Subscribe to toggle events
   *
   * @returns Observable<{ compact: boolean, tag: string }>
   */
  onToggle(): Observable<{ compact: boolean, tag: string }> {
    return this.toggle$.pipe(share());
  }

  /**
   * Subscribe to expand events
   * @returns Observable<{ tag: string }>
   */
  onExpand(): Observable<{ tag: string }> {
    return this.expand$.pipe(share());
  }

  /**
   * Subscribe to collapse evens
   * @returns Observable<{ tag: string }>
   */
  onCollapse(): Observable<{ tag: string }> {
    return this.collapse$.pipe(share());
  }

  /**
   * Subscribe to compact evens
   * @returns Observable<{ tag: string }>
   */
  onCompact(): Observable<{ tag: string }> {
    return this.compact$.pipe(share());
  }

  /**
   * Toggle a sidebar
   * @param {boolean} compact
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  toggle(compact = false, tag?: string) {
    this.toggle$.next({compact, tag});
  }

  /**
   * Expands a sidebar
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  expand(tag?: string) {
    this.expand$.next({tag});
  }

  /**
   * Collapses a sidebar
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  collapse(tag?: string) {
    this.collapse$.next({tag});
  }

  /**
   * Makes sidebar compact
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar you want to control
   */
  compact(tag?: string) {
    this.compact$.next({tag});
  }

  /**
   * Returns sidebar state observable which emits once
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar state you need
   */
  getSidebarState(tag?: string): Observable<TriSidebarState> {
    const observer = new ReplaySubject<TriSidebarState>(1);
    getSidebarState$.next({observer, tag});
    return observer.pipe(publish(), refCount());
  }

  /**
   * Returns sidebar state observable which emits once
   * @param {string} tag If you have multiple sidebars on the page, mark them with `tag` input property and pass it here
   * to specify which sidebar responsive state you need
   */
  getSidebarResponsiveState(tag?: string): Observable<TriSidebarResponsiveState> {
    const observer = new ReplaySubject<TriSidebarResponsiveState>();
    getSidebarResponsiveState$.next({observer, tag});
    return observer.pipe(publish(), refCount());
  }
}
