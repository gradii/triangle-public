/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy,
  OnInit, Output,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { getSidebarResponsiveState$, getSidebarState$, TriSidebarService } from './sidebar.service';

export type TriSidebarState = 'expanded' | 'collapsed' | 'compacted';
export type TriSidebarResponsiveState = 'mobile' | 'tablet' | 'pc';


@Component({
  selector: 'tri-sidebar-header',
  template: `
    <ng-content></ng-content>
  `,
})
export class TriSidebarHeaderComponent {
}

@Component({
  selector: 'tri-sidebar-footer',
  template: `
    <ng-content></ng-content>
  `,
})
export class TriSidebarFooterComponent {
}

@Component({
  selector       : 'nb-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <div class="main-container"
         [class.main-container-fixed]="containerFixedValue">
      <ng-content select="tri-sidebar-header"></ng-content>
      <div class="scrollable" (click)="onClick($event)">
        <ng-content></ng-content>
      </div>
      <ng-content select="tri-sidebar-footer"></ng-content>
    </div>
  `,
  styleUrls      : ['../style/sidebar.scss'],
  host           : {
    '[class.fixed]': 'fixedValue',
    '[class.right]': 'rightValue',
    '[class.left]' : 'leftValue',
    '[class.start]': 'startValue',
    '[class.end]'  : 'endValue',
    '[class.expanded]': `state === 'expanded'`,
    '[class.collapsed]': `state === 'collapsed'`,
    '[class.compacted]': `state === 'compacted'`,
  }
})
export class TriSidebarComponent implements OnInit, OnDestroy {

  protected readonly responsiveValueChange$: Subject<boolean> = new Subject<boolean>();
  protected responsiveState: TriSidebarResponsiveState        = 'pc';

  protected destroy$ = new Subject<void>();

  containerFixedValue: boolean = true;

  fixedValue: boolean = false;
  rightValue: boolean = false;
  leftValue: boolean   = true;
  startValue: boolean = false;
  endValue: boolean     = false;

  get expanded() {
    return this.state === 'expanded';
  }

  get collapsed() {
    return this.state === 'collapsed';
  }

  get compacted() {
    return this.state === 'compacted';
  }

  /**
   * Places sidebar on the right side
   * @type {boolean}
   */
  @Input()
  set right(val: boolean) {
    this.rightValue = coerceBooleanProperty(val);
    this.leftValue  = !this.rightValue;
    this.startValue = false;
    this.endValue   = false;
  }

  static ngAcceptInputType_right: BooleanInput;

  /**
   * Places sidebar on the left side
   * @type {boolean}
   */
  @Input()
  set left(val: boolean) {
    this.leftValue  = coerceBooleanProperty(val);
    this.rightValue = !this.leftValue;
    this.startValue = false;
    this.endValue   = false;
  }

  static ngAcceptInputType_left: BooleanInput;

  /**
   * Places sidebar on the start edge of layout
   * @type {boolean}
   */
  @Input()
  set start(val: boolean) {
    this.startValue = coerceBooleanProperty(val);
    this.endValue   = !this.startValue;
    this.leftValue  = false;
    this.rightValue = false;
  }

  static ngAcceptInputType_start: BooleanInput;

  /**
   * Places sidebar on the end edge of layout
   * @type {boolean}
   */
  @Input()
  set end(val: boolean) {
    this.endValue   = coerceBooleanProperty(val);
    this.startValue = !this.endValue;
    this.leftValue  = false;
    this.rightValue = false;
  }

  static ngAcceptInputType_end: BooleanInput;

  /**
   * Makes sidebar fixed (shown above the layout content)
   * @type {boolean}
   */
  @Input()
  set fixed(val: boolean) {
    this.fixedValue = coerceBooleanProperty(val);
  }

  static ngAcceptInputType_fixed: BooleanInput;

  /**
   * Makes sidebar container fixed
   * @type {boolean}
   */
  @Input()
  set containerFixed(val: boolean) {
    this.containerFixedValue = coerceBooleanProperty(val);
  }

  static ngAcceptInputType_containerFixed: BooleanInput;

  /**
   * Initial sidebar state, `expanded`|`collapsed`|`compacted`
   * @type {string}
   */
  @Input()
  get state(): TriSidebarState {
    return this._state;
  }

  set state(value: TriSidebarState) {
    this._state = value;
  }

  protected _state: TriSidebarState = 'expanded';

  /**
   * Makes sidebar listen to media query events and change its behaviour
   * @type {boolean}
   */
  @Input()
  get responsive(): boolean {
    return this._responsive;
  }

  set responsive(value: boolean) {
    if (this.responsive !== coerceBooleanProperty(value)) {
      this._responsive = !this.responsive;
      this.responsiveValueChange$.next(this.responsive);
    }
  }

  protected _responsive: boolean = false;
  static ngAcceptInputType_responsive: BooleanInput;

  /**
   * Tags a sidebar with some ID, can be later used in the sidebar service
   * to determine which sidebar triggered the action, if multiple sidebars exist on the page.
   *
   * @type {string}
   */
  @Input() tag: string;

  // TODO: get width by the key and define only max width for the tablets and mobiles
  /**
   * Controls on which screen sizes sidebar should be switched to compacted state.
   * Works only when responsive mode is on.
   * Default values are `['xs', 'is', 'sm', 'md', 'lg']`.
   *
   * @type string[]
   */
  @Input() compactedBreakpoints: string[] = ['xs', 'is', 'sm', 'md', 'lg'];

  /**
   * Controls on which screen sizes sidebar should be switched to collapsed state.
   * Works only when responsive mode is on.
   * Default values are `['xs', 'is']`.
   *
   * @type string[]
   */
  @Input() collapsedBreakpoints: string[] = ['xs', 'is'];

  /**
   * Emits whenever sidebar state change.
   */
  @Output() readonly stateChange = new EventEmitter<TriSidebarState>();

  /**
   * Emits whenever sidebar responsive state change.
   */
  @Output() readonly responsiveStateChange = new EventEmitter<TriSidebarResponsiveState>();

  constructor(
    private sidebarService: TriSidebarService,
    // private themeService: NbThemeService,
    private element: ElementRef,
    private cd: ChangeDetectorRef,
  ) {
  }

  ngOnInit() {
    this.sidebarService.onToggle()
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(({compact}) => this.toggle(compact));

    this.sidebarService.onExpand()
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.expand());

    this.sidebarService.onCollapse()
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.collapse());

    this.sidebarService.onCompact()
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.compact());

    getSidebarState$
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(({observer}) => observer.next(this.state));

    getSidebarResponsiveState$
      .pipe(
        filter(({tag}) => !this.tag || this.tag === tag),
        takeUntil(this.destroy$),
      )
      .subscribe(({observer}) => observer.next(this.responsiveState));

    this.responsiveValueChange$
      .pipe(
        filter((responsive: boolean) => !responsive),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.expand());

    // this.subscribeToMediaQueryChange();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // TODO: this is more of a workaround, should be a better way to make components communicate to each other
  onClick(event): void {
    const menu = this.element.nativeElement.querySelector('nb-menu');

    if (menu && menu.contains(event.target)) {
      const link = this.getMenuLink(event.target);

      if (link && link.nextElementSibling && link.nextElementSibling.classList.contains(
        'menu-items')) {
        this.sidebarService.expand(this.tag);
      }
    }
  }

  /**
   * Collapses the sidebar
   */
  collapse() {
    this.updateState('collapsed');
  }

  /**
   * Expands the sidebar
   */
  expand() {
    this.updateState('expanded');
  }

  /**
   * Compacts the sidebar (minimizes)
   */
  compact() {
    this.updateState('compacted');
  }

  /**
   * Toggles sidebar state (expanded|collapsed|compacted)
   * @param {boolean} compact If true, then sidebar state will be changed between expanded & compacted,
   * otherwise - between expanded & collapsed. False by default.
   *
   * Toggle sidebar state
   *
   * ```ts
   * this.sidebar.toggle(true);
   * ```
   */
  toggle(compact: boolean = false) {
    if (this.responsive) {
      if (this.responsiveState === 'mobile') {
        compact = false;
      }
    }

    if (this.state === 'compacted' || this.state === 'collapsed') {
      this.updateState('expanded');
    } else {
      this.updateState(compact ? 'compacted' : 'collapsed');
    }
  }

  // protected subscribeToMediaQueryChange() {
  //   combineLatest([
  //     this.responsiveValueChange$.pipe(startWith(this.responsive)),
  //     this.themeService.onMediaQueryChange(),
  //   ])
  //     .pipe(
  //       filter(([responsive]) => responsive),
  //       map(([, breakpoints]) => breakpoints),
  //       takeUntil(this.destroy$),
  //     )
  //     .subscribe(([prev, current]: [NbMediaBreakpoint, NbMediaBreakpoint]) => {
  //
  //       const isCollapsed = this.collapsedBreakpoints.includes(current.name);
  //       const isCompacted = this.compactedBreakpoints.includes(current.name);
  //
  //       let newResponsiveState;
  //
  //       if (isCompacted) {
  //         this.fixed = this.containerFixedValue;
  //         this.compact();
  //         newResponsiveState = 'tablet';
  //       }
  //       if (isCollapsed) {
  //         this.fixed = true;
  //         this.collapse();
  //         newResponsiveState = 'mobile';
  //       }
  //       if (!isCollapsed && !isCompacted && (!prev.width || prev.width < current.width)) {
  //         this.expand();
  //         this.fixed         = false;
  //         newResponsiveState = 'pc';
  //       }
  //
  //       if (newResponsiveState && newResponsiveState !== this.responsiveState) {
  //         this.responsiveState = newResponsiveState;
  //         this.responsiveStateChange.emit(this.responsiveState);
  //         this.cd.markForCheck();
  //       }
  //     });
  // }

  protected getMenuLink(element: HTMLElement): HTMLElement | undefined {
    if (!element || element.tagName.toLowerCase() === 'nb-menu') {
      return undefined;
    }

    if (element.tagName.toLowerCase() === 'a') {
      return element;
    }

    return this.getMenuLink(element.parentElement);
  }

  protected updateState(state: TriSidebarState): void {
    if (this.state !== state) {
      this.state = state;
      this.stateChange.emit(this.state);
      this.cd.markForCheck();
    }
  }

  /**
   * @deprecated Use `responsive` property instead
   * @breaking-change Remove @8.0.0
   */
  toggleResponsive(enabled: boolean) {
    this.responsive = enabled;
  }

  /**
   * @deprecated Use TriSidebarState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly STATE_EXPANDED: string  = 'expanded';
  /**
   * @deprecated Use TriSidebarState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly STATE_COLLAPSED: string = 'collapsed';
  /**
   * @deprecated Use TriSidebarState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly STATE_COMPACTED: string = 'compacted';

  /**
   * @deprecated Use TriSidebarResponsiveState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly RESPONSIVE_STATE_MOBILE: string = 'mobile';
  /**
   * @deprecated Use TriSidebarResponsiveState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly RESPONSIVE_STATE_TABLET: string = 'tablet';
  /**
   * @deprecated Use TriSidebarResponsiveState type instead
   * @breaking-change Remove @8.0.0
   */
  static readonly RESPONSIVE_STATE_PC: string     = 'pc';
}
