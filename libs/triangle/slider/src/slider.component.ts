/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TRI_INTERNAL_SLIDER } from './slider.types';
import { fromEvent, merge, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, pluck, takeUntil, tap } from 'rxjs/operators';
import { Marks, MarksArray } from './slider-marks.component';
import { SliderService } from './slider.service';

export type SliderValue = number[] | number;

export class SliderHandle {
  offset: number;
  value: number;
  active: boolean;
}

@Component({
  selector     : 'tri-slider',
  encapsulation: ViewEncapsulation.None,
  providers    : [
    {provide: TRI_INTERNAL_SLIDER, useExisting: forwardRef(() => SliderComponent)},
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi      : true
    }
  ],
  template     : `
    <div #slider [ngClass]="classMap">
      <div class="tri-slider-rail"></div>
      <tri-slider-track
        className="tri-slider-track"
        [vertical]="vertical"
        [included]="included"
        [offset]="track.offset"
        [length]="track.length"
      ></tri-slider-track>
      <tri-slider-step *ngIf="marksArray"
                       prefixCls="{{prefixCls}}"
                       [vertical]="vertical"
                       [lowerBound]="bounds.lower"
                       [upperBound]="bounds.upper"
                       [marksArray]="marksArray"
                       [included]="included"
      ></tri-slider-step>
      <tri-slider-handle
        *ngFor="let handle of handles;"
        className="tri-slider-handle"
        [vertical]="vertical"
        [offset]="handle.offset"
        [value]="handle.value"
        [active]="handle.active"
        [tipFormatter]="tipFormatter"
      ></tri-slider-handle>
      <tri-slider-marks *ngIf="marksArray"
                        className="tri-slider-mark"
                        [vertical]="vertical"
                        [min]="min"
                        [max]="max"
                        [lowerBound]="bounds.lower"
                        [upperBound]="bounds.upper"
                        [marksArray]="marksArray"
                        [included]="included"
      ></tri-slider-marks>
    </div>
  `
})
export class SliderComponent implements ControlValueAccessor, OnInit, OnChanges, OnDestroy {
  // Debugging
  @Input() debugId: number | string = null; // set this id will print debug informations to console

  // Dynamic property settings
  @Input() disabled = false;

  /**
   * Static configurations (properties that can only specify once)
   * 步长。取值必须大于 0，并且可被 (max - min) 整除。当  `marks`  不为空对象时，可以设置  `step`  为  `null` ，此时 Slider 的可选值仅有 marks 标出来的部分。
   */
  @Input() step = 1;

  /**
   * The mark.
   * 刻度标记。key 的类型必须为  `number`  且取值在闭区间 [min, max] 内，每个标签可以单独设置样式。
   */
  @Input() marks: Marks = null;

  /**
   * Whether only can drag on dot
   * 是否只能拖拽到刻度上
   */
  @Input() dots = false;

  /**
   * Min value
   * 最小值
   */
  @Input() min = 0;

  /**
   * Max value
   * 最大值
   */
  @Input() max = 100;

  /**
   * Whether include
   * 是否包含。 `marks`  不为空对象时有效，值为 true 时表示值为包含关系，false 表示并列
   */
  @Input() included                  = true;
  /**
   * Set default value
   * 设置初始取值。当  `range`  为  `false`  时，使用  `number` ，否则用  `[number, number]`
   */
  @Input() defaultValue: SliderValue = null;

  /**
   * Format the tip
   * Slider 会把当前值传给  `nzTipFormatter` ，并在  `Tooltip`  中显示  `nzTipFormatter`  的返回值，若为  `null` ，则隐藏  `Tooltip` 。
   */
  @Input() tipFormatter: Function;

  /**
   * The event of on after change
   */
  @Output()
  onAfterChange = new EventEmitter<SliderValue>();

  value: SliderValue        = null; // CORE value state
  sliderDOM: any;
  cacheSliderStart: number  = null;
  cacheSliderLength: number = null;
  prefixCls                 = 'tri-slider';
  classMap: Object;
  activeValueIndex: number  = null; // Current activated handle's index ONLY for range=true
  track                     = {offset: null, length: null}; // Track's offset and length
  handles: SliderHandle[]; // Handles' offset
  marksArray: MarksArray; // "marks" in array type with more data & FILTER out the invalid mark
  bounds                    = {lower: null, upper: null}; // now for tri-slider-step
  onValueChange: Function; // Used by ngModel. BUG: onValueChange() will not success to effect the "value" variable ( [(ngModel)]="value" ) when the first initializing, except using "nextTick" functionality (MAY angular2's problem ?)
  isDragging                = false; // Current dragging state
  // Events observables & subscriptions
  dragstart$: Observable<any>;
  dragmove$: Observable<any>;
  dragend$: Observable<any>;
  dragstart_: Subscription;
  dragmove_: Subscription;
  dragend_: Subscription;
  @ViewChild('slider', {static: false}) private slider: ElementRef;

  constructor(private utils: SliderService) {
  }

  // Inside properties
  _range = false;

  /**
   * Get range
   * 获取 range
   */
  get range() {
    return this._range;
  }

  /**
   * Set this property, then enable double slider mode
   * 当添加该属性时，启动双滑块模式
   * @param  value
   */
  @Input()
  set range(value: boolean | string) {
    if (value === '') {
      this._range = true;
    } else {
      this._range = value as boolean;
    }
  }

  _vertical = false;

  /**
   * Get whether vertical
   * 获取是否坚直显示
   */
  get vertical(): boolean {
    return this._vertical;
  }

  // |--------------------------------------------------------------------------------------------
  // | value accessors & ngModel accessors
  // |--------------------------------------------------------------------------------------------

  /**
   * Vertical display. when add this property, slider is vertical direction
   * 竖直显示。添加该属性时，Slider 为垂直方向。
   * @param  value
   */
  @Input()
  set vertical(value: boolean) {
    this._vertical = value;
  }

  setValue(val: SliderValue, isWriteValue: boolean = false) {
    if (isWriteValue) {
      // [ngModel-writeValue]: Formatting before setting value, always update current value, but trigger onValueChange ONLY when the "formatted value" not equals "input value"
      this.value = this.formatValue(val);
      this.log(`[ngModel:setValue/writeValue]Update track & handles`);
      this.updateTrackAndHandles();
      // if (!this.isValueEqual(this.value, val)) {
      //   this.log(`[ngModel:setValue/writeValue]onValueChange`, val);
      //   if (this.onValueChange) { // NOTE: onValueChange will be unavailable when writeValue() called at the first time
      //     this.onValueChange(this.value);
      //   }
      // }
    } else {
      // [Normal]: setting value, ONLY check changed, then update and trigger onValueChange
      if (!this.isValueEqual(this.value, val)) {
        this.value = val;
        this.log(`[Normal:setValue]Update track & handles`);
        this.updateTrackAndHandles();
        this.log(`[Normal:setValue]onValueChange`, val);
        if (this.onValueChange) {
          // NOTE: onValueChange will be unavailable when writeValue() called at the first time
          this.onValueChange(this.value);
        }
      }
    }
  }

  getValue(cloneAndSort = false): SliderValue {
    if (cloneAndSort && this.range) {
      // clone & sort range values
      return this.utils.cloneArray(<number[]>this.value).sort((a, b) => a - b);
    }
    return this.value;
  }

  // clone & sort current value and convert them to offsets, then return the new one
  getValueToOffset(value?: SliderValue) {
    if (typeof value === 'undefined') {
      value = this.getValue(true);
    }
    return this.range ? (<number[]>value).map(val => this.valueToOffset(val)) : this.valueToOffset(value);
  }

  writeValue(val: SliderValue) {
    // NOTE: writeValue will be called twice when initialized (may BUG? see: https://github.com/angular/angular/issues/14988), here we just ignore the first inited(the first the onValueChange will not registered)
    if (typeof this.onValueChange !== 'function') {
      return;
    } // ignore the first initial call
    this.log(`[ngModel/writeValue]current writing value = `, val);
    this.setValue(val, true);
  }

  registerOnChange(fn: Function) {
    this.onValueChange = fn;
  }

  registerOnTouched(fn) {
  }

  // |--------------------------------------------------------------------------------------------
  // | Lifecycle hooks
  // |--------------------------------------------------------------------------------------------

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.toggleDragDisabled(isDisabled);
    this.setClassMap();
  }

  // initialize event binding, class init, etc. (called only once)
  ngOnInit() {
    // initial checking
    this.checkValidValue(this.defaultValue); // check nzDefaultValue
    // default handles
    this.handles   = this._generateHandles(this.range ? 2 : 1);
    // initialize
    this.sliderDOM = this.slider.nativeElement;
    if (this.getValue() === null) {
      this.setValue(this.formatValue(null));
    } // init with default value
    this.marksArray = this.marks === null ? null : this.toMarksArray(this.marks);
    // event bindings
    this.createDrag();
    // initialize drag's disabled status
    this.toggleDragDisabled(this.disabled);
    // the first time to init classes
    this.setClassMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    const {disabled} = changes;
    if (disabled && !disabled.firstChange) {
      this.toggleDragDisabled(disabled.currentValue);
      this.setClassMap();
    }
  }

  ngOnDestroy() {
    this.unsubscribeDrag();
  }

  // |--------------------------------------------------------------------------------------------
  // | Basic flow functions
  // |--------------------------------------------------------------------------------------------

  setClassMap() {
    const {prefixCls, disabled, vertical, marksArray} = this;
    this.classMap                                     = {
      [prefixCls]                : true,
      [`${prefixCls}-disabled`]  : disabled,
      [`${prefixCls}-vertical`]  : vertical,
      [`${prefixCls}-with-marks`]: marksArray ? marksArray.length : 0
    };
  }

  // find the cloest value to be activated (only for range = true)
  setActiveValueIndex(pointerValue: number): void {
    if (this.range) {
      let minimal = null,
          gap,
          activeIndex;
      (<number[]>this.getValue()).forEach((val, index) => {
        gap = Math.abs(pointerValue - val);
        if (minimal === null || gap < minimal) {
          minimal     = gap;
          activeIndex = index;
        }
      });
      this.activeValueIndex = activeIndex;
    }
  }

  setActiveValue(pointerValue: number) {
    if (this.range) {
      const newValue                  = this.utils.cloneArray(<number[]>this.value);
      newValue[this.activeValueIndex] = pointerValue;
      this.setValue(newValue);
    } else {
      this.setValue(pointerValue);
    }
  }

  updateTrackAndHandles() {
    const value        = this.getValue();
    const offset       = this.getValueToOffset(value);
    const valueSorted  = this.getValue(true);
    const offsetSorted = this.getValueToOffset(valueSorted);
    const boundParts   = this.range ? <number[]>valueSorted : [0, valueSorted];
    const trackParts   = this.range ? [offsetSorted[0], offsetSorted[1] - offsetSorted[0]] : [0, offsetSorted];

    this.handles.forEach((handle, index) => {
      handle.offset = this.range ? offset[index] : offset;
      handle.value  = this.range ? value[index] : value;
    });
    [this.bounds.lower, this.bounds.upper] = boundParts;
    [this.track.offset, this.track.length] = trackParts;
  }

  toMarksArray(marks) {
    const {min, max} = this;
    const marksArray = [];
    for (const key in marks) {
      const mark = marks[key];
      const val  = typeof key === 'number' ? key : parseFloat(key);
      if (val < min || val > max) {
        continue;
      }
      marksArray.push({value: val, offset: this.valueToOffset(val), config: mark});
    }
    return marksArray;
  }

  // |--------------------------------------------------------------------------------------------
  // | Event listeners & bindings
  // |--------------------------------------------------------------------------------------------

  onDragStart(value: number) {
    this.log('[onDragStart]dragging value = ', value);
    this.toggleDragMoving(true);
    // cache DOM layout/reflow operations
    this.cacheSliderProperty();
    // trigger drag start
    this.setActiveValueIndex(value);
    this.setActiveValue(value);
    // Tooltip visibility of handles
    this._showHandleTooltip(this.range ? this.activeValueIndex : 0);
  }

  onDragMove(value: number) {
    this.log('[onDragMove]dragging value = ', value);
    // trigger drag moving
    this.setActiveValue(value);
  }

  onDragEnd() {
    this.log('[onDragEnd]');
    this.toggleDragMoving(false);
    this.onAfterChange.emit(this.getValue(true));
    // remove cache DOM layout/reflow operations
    this.cacheSliderProperty(true);
    // Hide all tooltip
    this._hideAllHandleTooltip();
  }

  createDrag() {
    const sliderDOM   = this.sliderDOM,
          orientField = this.vertical ? 'pageY' : 'pageX',
          mouse: any  = {
            start   : 'mousedown',
            move    : 'mousemove',
            end     : 'mouseup',
            pluckKey: [orientField]
          },
          touch: any  = {
            start   : 'touchstart',
            move    : 'touchmove',
            end     : 'touchend',
            pluckKey: ['touches', '0', orientField],
            filter  : (e: MouseEvent | TouchEvent) => !this.utils.isNotTouchEvent(<TouchEvent>e)
          };
    // make observables
    [mouse, touch].forEach(source => {
      const {start, move, end, pluckKey, filterFunc = ((value: any, index: number) => true) as any} = source;
      // start
      source.startPlucked$                                                                          = fromEvent(sliderDOM,
        start).pipe(
        filter(filterFunc),
        tap(this.utils.pauseEvent),
        // @ts-ignore
        pluck<any, any>(...pluckKey),
        map((position: number) => this.findClosestValue(position))
      );
      // end
      source.end$                                                                                   = fromEvent(document, end);
      // resolve move
      source.moveResolved$                                                                          = fromEvent(document,
        move).pipe(
        filter(filterFunc),
        tap(this.utils.pauseEvent),
        pluck(...pluckKey),
        distinctUntilChanged<any>(),
        map((position: number) => this.findClosestValue(position)),
        distinctUntilChanged(),
        takeUntil(source.end$)
      );
      // merge to become moving
      // source.move$ = source.startPlucked$.mergeMapTo(source.moveResolved$);
    });
    // merge mouse and touch observables
    this.dragstart$ = merge(mouse.startPlucked$, touch.startPlucked$);
    // this.dragmove$ = Observable.merge(mouse.move$, touch.move$);
    this.dragmove$  = merge(mouse.moveResolved$, touch.moveResolved$);
    this.dragend$   = merge(mouse.end$, touch.end$);
  }

  subscribeDrag(periods = ['start', 'move', 'end']) {
    this.log('[subscribeDrag]this.dragstart$ = ', this.dragstart$);
    if (periods.indexOf('start') !== -1 && this.dragstart$ && !this.dragstart_) {
      this.dragstart_ = this.dragstart$.subscribe(this.onDragStart.bind(this));
    }

    if (periods.indexOf('move') !== -1 && this.dragmove$ && !this.dragmove_) {
      this.dragmove_ = this.dragmove$.subscribe(this.onDragMove.bind(this));
    }

    if (periods.indexOf('end') !== -1 && this.dragend$ && !this.dragend_) {
      this.dragend_ = this.dragend$.subscribe(this.onDragEnd.bind(this));
    }
  }

  unsubscribeDrag(periods = ['start', 'move', 'end']) {
    this.log('[unsubscribeDrag]this.dragstart_ = ', this.dragstart_);
    if (periods.indexOf('start') !== -1 && this.dragstart_) {
      this.dragstart_.unsubscribe();
      this.dragstart_ = null;
    }

    if (periods.indexOf('move') !== -1 && this.dragmove_) {
      this.dragmove_.unsubscribe();
      this.dragmove_ = null;
    }

    if (periods.indexOf('end') !== -1 && this.dragend_) {
      this.dragend_.unsubscribe();
      this.dragend_ = null;
    }
  }

  toggleDragMoving(movable: boolean) {
    const periods = ['move', 'end'];
    if (movable) {
      this.isDragging = true;
      this.subscribeDrag(periods);
    } else {
      this.isDragging = false;
      this.unsubscribeDrag(periods);
    }
  }

  toggleDragDisabled(disabled: boolean) {
    if (disabled) {
      this.unsubscribeDrag();
    } else {
      this.subscribeDrag(['start']);
    }
  }

  // |--------------------------------------------------------------------------------------------
  // | Util functions (tools)
  // |--------------------------------------------------------------------------------------------

  // find the closest value depend on pointer's position
  findClosestValue(position: number): number {
    const {vertical, step, min, max, marks, dots, utils} = this,
          sliderStart                                    = this.getSliderStartPosition(),
          sliderLength                                   = this.getSliderLength();
    const ratio                                          = utils.correctNumLimit((position - sliderStart) / sliderLength, 0, 1),
          val                                            = (max - min) * (vertical ? 1 - ratio : ratio) + min,
          points                                         = (marks === null ? [] : Object.keys(marks).map(
            parseFloat)) as Array<any>;
    // push closest step
    if (step !== null && !dots) {
      const closest = Math.round(val / step) * step;
      points.push(closest);
    }
    // calculate gaps
    const gaps    = points.map(point => Math.abs(val - point));
    const closest = points[gaps.indexOf(Math.min(...gaps))];
    // return the fixed
    return step === null ? closest : parseFloat(closest.toFixed(utils.getPrecision(step)));
  }

  valueToOffset(value) {
    return this.utils.valueToOffset(this.min, this.max, value);
  }

  getSliderStartPosition() {
    if (this.cacheSliderStart !== null) {
      return this.cacheSliderStart;
    }
    const offset = this.utils.getElementOffset(this.sliderDOM);
    return this.vertical ? offset.top : offset.left;
  }

  getSliderLength() {
    if (this.cacheSliderLength !== null) {
      return this.cacheSliderLength;
    }
    const sliderDOM = this.sliderDOM;
    return this.vertical ? sliderDOM.clientHeight : sliderDOM.clientWidth;
  }

  // cache DOM layout/reflow operations for performance (may not necessary?)
  cacheSliderProperty(remove: boolean = false) {
    this.cacheSliderStart  = remove ? null : this.getSliderStartPosition();
    this.cacheSliderLength = remove ? null : this.getSliderLength();
  }

  formatValue(value: SliderValue): SliderValue {
    // NOTE: will return new value
    if (!this.checkValidValue(value)) {
      // if empty, use default value
      value = this.defaultValue === null ? (this.range ? [this.min, this.max] : this.min) : this.defaultValue;
    } else {
      // format
      value = this.range
        ? (<number[]>value).map(val => this.utils.correctNumLimit(val, this.min, this.max))
        : this.utils.correctNumLimit(value, this.min, this.max);
    }
    return value;
  }

  // check if value is valid and throw error if value-type/range not match
  checkValidValue(value) {
    const range = this.range;
    if (value === null || value === undefined) {
      return false;
    } // it's an invalid value, just return
    const isArray = Array.isArray(value);
    if (!isArray) {
      if (typeof value !== 'number') {
        value = parseFloat(value);
      }
      if (isNaN(value)) {
        return false;
      } // it's an invalid value, just return
    }
    if (isArray !== !!range) {
      // value type not match
      throw new Error(
        `The "range" can't match the "value"'s type, please check these properties: "range", "value", "defaultValue".`
      );
    }
    return true;
  }

  isValueEqual(value: SliderValue, val: SliderValue) {
    if (typeof value !== typeof val) {
      return false;
    }
    if (Array.isArray(value)) {
      const len = (<number[]>value).length;
      for (let i = 0; i < len; i++) {
        if (value[i] !== val[i]) {
          return false;
        }
      }
      return true;
    } else {
      return value === val;
    }
  }

  // print debug info
  log(...messages: Array<any>) {
    if (this.debugId !== null) {
      const args = [`[tri-slider][#${this.debugId}] `].concat(Array.prototype.slice.call(arguments));
      console.log(...args);
    }
  }

  // Show one handle's tooltip and hide others'
  private _showHandleTooltip(handleIndex = 0) {
    this.handles.forEach((handle, index) => {
      this.handles[index].active = index === handleIndex;
    });
  }

  private _hideAllHandleTooltip() {
    this.handles.forEach(handle => (handle.active = false));
  }

  private _generateHandles(amount: number) {
    const handles: SliderHandle[] = [];
    for (let i = 0; i < amount; i++) {
      handles.push({offset: null, value: null, active: false});
    }
    return handles;
  }
}
