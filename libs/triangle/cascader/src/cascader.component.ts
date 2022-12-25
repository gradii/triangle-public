/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

// tslint:disable:no-any
import {
  BACKSPACE, DOWN_ARROW, ENTER, ESCAPE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW
} from '@angular/cdk/keycodes';
import {
  CdkConnectedOverlay, ConnectedOverlayPositionChange, ConnectionPositionPair
} from '@angular/cdk/overlay';
import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostListener, Input,
  OnDestroy, Output, TemplateRef, ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DEFAULT_DROPDOWN_POSITIONS, DropDownAnimation } from '@gradii/triangle/core';
import { coerceToArray, isArray, isObject, loop } from '@gradii/triangle/util';

function arrayEquals<T>(array1: T[], array2: T[]): boolean {
  if (!array1 || !array2 || array1.length !== array2.length) {
    return false;
  }

  const len = array1.length;
  for (let i = 0; i < len; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }
  return true;
}

const defaultDisplayRender = (labels: string[], selectedOptions: any[]) => labels.join(' / ');

export type CascaderExpandTrigger = 'click' | 'hover';
export type CascaderTriggerType = 'click' | 'hover';
export type CascaderSize = 'small' | 'large' | 'default';

export interface CascaderOption {
  value?: any;
  label?: string;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  isLeaf?: boolean;
  parent?: CascaderOption;
  children?: CascaderOption[];
  name?: string;

  [key: string]: any;
}


export interface CascaderSearchOption extends CascaderOption {
  path: CascaderOption[];
}

export interface ShowSearchOptions {
  filter?(inputValue: string, path: CascaderOption[]): boolean;

  sorter?(a: CascaderOption[], b: CascaderOption[], inputValue: string): number;
}


@Component({
  selector   : 'tri-cascader',
  animations : [
    DropDownAnimation
  ],
  templateUrl: './cascader.component.html',
  providers  : [
    {
      provide    : NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascaderComponent),
      multi      : true
    }
  ],
  host       : {
    '[attr.tabIndex]'                       : '"0"',
    '[class.tri-cascader]'                  : 'true',
    '[class.tri-cascader-picker]'           : 'true',
    '[class.tri-cascader-lg]'               : 'size === "large"',
    '[class.tri-cascader-sm]'               : 'size === "small"',
    '[class.tri-cascader-picker-disabled]'  : 'disabled',
    '[class.tri-cascader-focused]'          : 'isFocused',
    '[class.tri-cascader-picker-open]'      : 'menuVisible',
    '[class.tri-cascader-picker-with-value]': '_inputValue && _inputValue.length'
  },
  styles     : [
    `.tri-cascader {
      display : block;
    }`,
    `.tri-cascader-menus {
      margin-top    : 4px;
      margin-bottom : 4px;
      top           : 100%;
      left          : 0;
      position      : relative;
      width         : 100%;
    }`
  ],
  styleUrls  : [
    '../style/cascader.scss'
  ]
})
export class CascaderComponent implements OnDestroy, ControlValueAccessor {
  dropDownPosition                                                    = 'bottom';
  menuVisible                                                         = false;
  isLoading                                                           = false;
  el: HTMLElement;
  isFocused                                                           = false;
  isLabelRenderTemplate                                               = false;
  labelRenderText: string;
  labelRenderContext: any                                             = {};
  // 表示当前菜单的数据列：all data columns
  columns: CascaderOption[][]                                         = [];
  searchWidthStyle: string;
  /** If cascader is in search mode. */
  inSearch                                                            = false;
  // ngModel Access
  onChange: any                                                       = loop;
  onTouched: any                                                      = loop;
  positions: ConnectionPositionPair[]                                 = [...DEFAULT_DROPDOWN_POSITIONS];
  /** Whether is disabled */
  @Input() disabled: boolean                                          = false;
  /** Input size, one of `large` `default` `small` */
  @Input() size: CascaderSize                                         = 'default';
  /** Whether show input box. Defaults to `true`. */
  @Input() showInput: boolean                                         = true;
  /** Whether allow clear. Defaults to `true`. */
  @Input() allowClear: boolean                                        = true;
  /** Whether auto focus. */
  @Input()
  autoFocus: boolean                                                  = false;
  /** Whether to show arrow */
  @Input()
  showArrow: boolean                                                  = true;
  /** Change value on each selection if set to true */
  @Input() changeOnSelect: boolean                                    = false;
  /** Hover text for the clear icon */
  @Input() clearText                                                  = 'Clear';
  /** Expand column item when click or hover, one of 'click' 'hover' */
  @Input() expandTrigger: CascaderExpandTrigger                       = 'click';
  /** Specify content to show when no result matches. */
  @Input() notFoundContent                                            = 'Not Found';
  /** Input placeholder */
  @Input() placeHolder                                                = 'Please select';
  /** Additional style of popup overlay */
  @Input() menuStyle: { [key: string]: string; };
  /** Change value on selection only if this function returns `true` */
  @Input() changeOn: (option: CascaderOption, level: number) => boolean;
  /** Delay time to show when mouse enter, when `expandTrigger` is `hover`. */
  @Input() mouseEnterDelay                                            = 150; // ms
  /** Delay time to hide when mouse enter, when `expandTrigger` is `hover`. */
  @Input() mouseLeaveDelay                                            = 150; // ms
  /** Triggering mode: can be Array<'click'|'hover'> */
  @Input() triggerAction: CascaderTriggerType | CascaderTriggerType[] = ['click'];
  /** Property name for getting `value` in the option */
  @Input() valueProperty                                              = 'value';
  /** Property name for getting `label` in the option */
  @Input() labelProperty                                              = 'label';
  @Input() valueType: 'simple' | 'normal' | 'all'                     = 'simple';
  @Input() maxColumn                                                  = Infinity;
  /** 异步加载数据 */
  @Input() loadData: (node: CascaderOption, index?: number) => PromiseLike<any>;
  /** Event: emit on popup show or hide */
  @Output() visibleChange                                             = new EventEmitter<boolean>();
  /** Event: emit on values changed */
  @Output() change                                                    = new EventEmitter<any[] | Object>();
  /** Event: emit on values and selection changed */
  @Output() selectionChange                                           = new EventEmitter<CascaderOption[]>();
  /**
   * Event: emit on option selected, event data：{option: any, index: number}
   */
  @Output() selectEvent                                               = new EventEmitter<{
    option: CascaderOption,
    index: number
  }>();
  /** Event: emit on the clear button clicked */
  @Output() clear                                                     = new EventEmitter<void>();
  @ViewChild('input', {static: false}) input: ElementRef;
  /** 浮层菜单 */
  @ViewChild('menu', {static: false}) menu: ElementRef;
  @ViewChild(CdkConnectedOverlay, {static: false}) overlayDir: CdkConnectedOverlay;
  private defaultValue: any[];
  private isOpening                                                   = false;
  /** 选择选项后，渲染显示文本 */
  private labelRenderTpl: TemplateRef<any>;
  // 当前值
  private value: any[];
  // 已选择的选项表示当前已确认的选项：selection will trigger value change
  private selectedOptions: CascaderOption[]                           = [];
  // 已激活的选项表示通过键盘方向键选择的选项，并未最终确认（除非按ENTER键）：activaction will not trigger value change
  private activatedOptions: CascaderOption[]                          = [];
  // 显示或隐藏菜单计时器
  private delayTimer: any;
  private delaySelectTimer: any;
  private oldColumnsHolder: any[];
  private oldActivatedOptions: CascaderOption[];

  constructor(private elementRef: ElementRef,
              private cdr: ChangeDetectorRef) {
    this.el = this.elementRef.nativeElement;
  }

  private _showSearch: boolean | ShowSearchOptions;

  get showSearch(): boolean | ShowSearchOptions {
    return this._showSearch;
  }

  /** Whether can search. Defaults to `false`. */
  @Input()
  set showSearch(value: boolean | ShowSearchOptions) {
    this._showSearch = value;
  }

  /** 搜索相关的输入值 */
  _inputValue: string = '';

  get inputValue(): string {
    return this._inputValue;
  }

  set inputValue(value: string) {
    this._inputValue = value;
    if (!this.inSearch) {
      this.oldActivatedOptions = this.activatedOptions;
      this.activatedOptions    = [];
    } else {
      this.activatedOptions = this.oldActivatedOptions;
    }

    this.inSearch = !!value;
    if (this.inSearch) {
      this.searchWidthStyle = `${this.input.nativeElement.offsetWidth}px`;
      this.prepareSearchValue();
    } else {
      this.columns          = this.oldColumnsHolder;
      this.searchWidthStyle = '';
    }
  }

  get labelRender(): TemplateRef<any> {
    return this.labelRenderTpl;
  }

  /** Display Render ngTemplate */
  @Input()
  set labelRender(value: TemplateRef<any>) {
    this.labelRenderTpl        = value;
    this.isLabelRenderTemplate = (value instanceof TemplateRef);
  }

  get options(): CascaderOption[] {
    return this.columns[0];
  }

  /** Options for first column, sub column will be load async */
  @Input()
  set options(options: CascaderOption[] | null) {
    this.oldColumnsHolder = this.columns = options && options.length ? [options] : [];
    if (this.defaultValue && this.columns.length) {
      this.initOptions(0);
    }
  }

  /** Whether to show input element placeholder */
  get showPlaceholder(): boolean {
    return !(this.hasInput() || this.hasValue());
  }

  /** Whether the clear button is visible */
  get showClearIcon(): boolean {
    const isHasValue = this.hasValue();
    const isHasInput = this.hasInput();
    return this.allowClear && !this.disabled && (isHasValue || isHasInput);
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    const newValue = position.connectionPair.originY === 'bottom' ? 'bottom' : 'top';
    if (this.dropDownPosition !== newValue) {
      this.dropDownPosition = newValue;
      this.cdr.detectChanges();
    }
  }

  focus(): void {
    if (!this.isFocused) {
      const input = this.el.querySelector(`.tri-cascader-input`) as HTMLElement;
      if (input && input.focus) {
        input.focus();
      } else {
        this.el.focus();
      }
      this.isFocused = true;
    }
  }

  blur(): void {
    if (this.isFocused) {
      const input = this.el.querySelector(`.tri-cascader-input`) as HTMLElement;
      if (input && input.blur) {
        input.blur();
      } else {
        this.el.blur();
      }
      this.isFocused = false;
    }
  }

  /** prevent input change event */
  handlerInputChange(event: Event): void {
    event.stopPropagation();
  }

  /** input element blur */
  handleInputBlur(event: Event): void {
    /*
    if (!this.showSearch) {
      return;
    }
    */
    if (this.menuVisible) {
      this.focus(); // keep input has focus when menu opened
    } else {
      this.blur();
    }
  }

  /** input element focus */
  handleInputFocus(event: Event): void {
    /*
    if (!this.showSearch) {
      return;
    }
    */
    this.focus();
  }

  /** clear the input box and selected options */
  clearSelection(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.labelRenderText = '';
    // this.isLabelRenderTemplate = false;
    // clear custom context
    this.labelRenderContext = {};
    this.selectedOptions    = [];
    this.activatedOptions   = [];
    this._inputValue        = '';
    this.setMenuVisible(false);

    // trigger change event
    this.onValueChange();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    if (keyCode !== DOWN_ARROW &&
      keyCode !== UP_ARROW &&
      keyCode !== LEFT_ARROW &&
      keyCode !== RIGHT_ARROW &&
      keyCode !== ENTER &&
      keyCode !== BACKSPACE &&
      keyCode !== ESCAPE) {
      return;
    }

    if (this.inSearch && (
      keyCode === BACKSPACE ||
      keyCode === LEFT_ARROW ||
      keyCode === RIGHT_ARROW
    )) {
      return;
    }

    // Press any keys above to reopen menu
    if (!this.isMenuVisible() &&
      keyCode !== BACKSPACE &&
      keyCode !== ESCAPE) {
      this.setMenuVisible(true);
      return;
    }
    // Press ESC to close menu
    if (keyCode === ESCAPE) {
      // this.setMenuVisible(false); // already call by cdk-overlay detach
      return;
    }

    if (this.isMenuVisible()) {
      event.preventDefault();
      if (keyCode === DOWN_ARROW) {
        this.moveDown();
      } else if (keyCode === UP_ARROW) {
        this.moveUp();
      } else if (keyCode === LEFT_ARROW) {
        this.moveLeft();
      } else if (keyCode === RIGHT_ARROW) {
        this.moveRight();
      } else if (keyCode === ENTER) {
        this.onEnter();
      }
    }
  }

  @HostListener('click', ['$event'])
  onTriggerClick(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    this.onTouched(); // set your control to 'touched'
    if (this.showSearch) {
      this.focus();
    }

    if (this.isClickTiggerAction()) {
      this.delaySetMenuVisible(!this.menuVisible, 100);
    }
  }

  @HostListener('mouseenter', ['$event'])
  onTriggerMouseEnter(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    if (this.isPointerTiggerAction()) {
      this.delaySetMenuVisible(true, this.mouseEnterDelay, true);
    }
  }

  @HostListener('mouseleave', ['$event'])
  onTriggerMouseLeave(event: MouseEvent): void {
    if (this.disabled) {
      return;
    }
    if (!this.isMenuVisible() || this.isOpening) {
      event.preventDefault();
      return;
    }
    if (this.isPointerTiggerAction()) {
      const mouseTarget = event.relatedTarget as HTMLElement;
      const hostEl      = this.el;
      const menuEl      = this.menu && this.menu.nativeElement as HTMLElement;
      if (hostEl.contains(mouseTarget) || (menuEl && menuEl.contains(mouseTarget))
        /*|| mouseTarget.parentElement.contains(menuEl)*/) {
        // 因为浮层的backdrop出现，暂时没有办法自动消失
        return;
      }
      this.delaySetMenuVisible(false, this.mouseLeaveDelay);
    }
  }

  closeMenu(): void {
    this.blur();
    this.clearDelayTimer();
    this.setMenuVisible(false);
  }

  /**
   * 显示或者隐藏菜单
   *
   * @param visible true-显示，false-隐藏
   * @param delay 延迟时间
   */
  delaySetMenuVisible(visible: boolean, delay: number, setOpening: boolean = false): void {
    this.clearDelayTimer();
    if (delay) {
      if (visible && setOpening) {
        this.isOpening = true;
      }
      this.delayTimer = setTimeout(() => {
        this.setMenuVisible(visible);
        this.clearDelayTimer();
        if (visible) {
          setTimeout(() => {
            this.isOpening = false;
          }, 100);
        }
      }, delay);
    } else {
      this.setMenuVisible(visible);
    }
  }

  isMenuVisible(): boolean {
    return this.menuVisible;
  }

  setMenuVisible(menuVisible: boolean): void {
    if (this.disabled) {
      return;
    }

    if (this.menuVisible !== menuVisible) {
      this.menuVisible = menuVisible;

      if (menuVisible) {
        this.beforeVisible();
      }
      this.visibleChange.emit(menuVisible);
    }
  }

  /** 获取Option的值，例如，可以指定labelProperty="name"来取Name */
  getOptionLabel(option: CascaderOption): any {
    return option[this.labelProperty || 'label'];
  }

  /** 获取Option的值，例如，可以指定valueProperty="id"来取ID */
  getOptionValue(option: CascaderOption): any {
    return option[this.valueProperty || 'value'];
  }

  isActivedOption(option: CascaderOption, index: number): boolean {
    const activeOpt = this.activatedOptions[index];
    return activeOpt === option;
  }

  /**
   * 鼠标点击选项
   *
   * @param option 菜单选项
   * @param index 选项所在的列组的索引
   * @param event 鼠标事件
   */
  onOptionClick(option: CascaderOption, index: number, event: Event): void {
    if (event) {
      event.preventDefault();
    }

    // Keep focused state for keyboard support
    this.el.focus();

    if (option && option.disabled) {
      return;
    }

    if (this.inSearch) {
      this.setSearchActiveOption(option as CascaderSearchOption, event);
    } else {
      this.setActiveOption(option, index, true);
    }
  }

  /**
   * 鼠标划入选项
   *
   * @param option 菜单选项
   * @param index 选项所在的列组的索引
   * @param event 鼠标事件
   */
  onOptionMouseEnter(option: CascaderOption, index: number, event: Event): void {
    event.preventDefault();
    if (this.expandTrigger === 'hover' && !option.isLeaf) {
      this.delaySelect(option, index, true);
    }
  }

  /**
   * 鼠标划出选项
   *
   * @param option 菜单选项
   * @param index 选项所在的列组的索引
   * @param event 鼠标事件
   */
  onOptionMouseLeave(option: CascaderOption, index: number, event: Event): void {
    event.preventDefault();
    if (this.expandTrigger === 'hover' && !option.isLeaf) {
      this.delaySelect(option, index, false);
    }
  }

  getSubmitValue(): any[] {
    const values: any[] = [];
    this.selectedOptions.forEach(option => {
      values.push(this.getOptionValue(option));
    });
    return values;
  }

  valueFormatter(): any[] | Object {
    if (this.valueType === 'normal') {
      return this.selectedOptions.reduce((acc, curr) => {
        acc[curr.name] = this.getOptionValue(curr);
        return acc;
      }, {});
    } else if (this.valueType === 'all') {
      const values: any[] = [];
      this.selectedOptions.forEach(option => {
        values.push(option);
      });
      return values;
    } else {
      const values: any[] = [];
      this.selectedOptions.forEach(option => {
        values.push(this.getOptionValue(option));
      });
      return values;
    }
  }

  afterWriteValue(): void {
    this.selectedOptions = this.activatedOptions;
    this.value           = this.getSubmitValue();
    this.buildDisplayLabel();
  }

  renderSearchString(str: string): string {
    return str.replace(new RegExp(this._inputValue, 'g'),
      `<span class="tri-cascader-menu-item-keyword">${this._inputValue}</span>`);
  }

  setSearchActiveOption(result: CascaderSearchOption, event: Event): void {
    this.activatedOptions = [result];
    this.delaySetMenuVisible(false, 200);

    setTimeout(() => {
      this.inputValue       = ''; // Not only remove `inputValue` but also reverse `nzColumns` in the hook.
      const index           = result.path.length - 1;
      const destiNode       = result.path[index];
      const mockClickParent = (node: CascaderOption, cIndex: number) => {
        if (node && node.parent) {
          mockClickParent(node.parent, cIndex - 1);
        }
        this.onOptionClick(node, cIndex, event);
      };
      mockClickParent(destiNode, index);
    }, 300);
  }

  /**
   * Write a new value to the element.
   *
   * @Override (From ControlValueAccessor interface)
   */
  writeValue(value: any): void {
    if (this.valueType === 'normal' && isObject(value)) {
      value = Object.values(value);
    } else if (this.valueType === 'all' && isArray(value)) {
      value = value.map(this.getOptionValue);
    } else {
      value = coerceToArray(value);
    }
    const vs = this.defaultValue = value;
    if (vs.length) {
      this.initOptions(0);
    } else {
      this.value            = vs;
      this.activatedOptions = [];
      this.afterWriteValue();
    }
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.closeMenu();
    }
    this.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.clearDelayTimer();
    this.clearDelaySelectTimer();
  }

  private hasInput(): boolean {
    return this._inputValue.length > 0;
  }

  private hasValue(): boolean {
    return this.value && this.value.length > 0;
  }

  private buildDisplayLabel(): void {
    const selectedOptions  = this.selectedOptions;
    const labels: string[] = selectedOptions.map(o => this.getOptionLabel(o));
    // 设置当前控件的显示值
    if (this.isLabelRenderTemplate) {
      this.labelRenderContext = {labels, selectedOptions};
    } else {
      this.labelRenderText = defaultDisplayRender.call(this, labels, selectedOptions);
    }
  }

  private isClickTiggerAction(): boolean {
    if (typeof this.triggerAction === 'string') {
      return this.triggerAction === 'click';
    }
    return this.triggerAction.indexOf('click') !== -1;
  }

  private isPointerTiggerAction(): boolean {
    if (typeof this.triggerAction === 'string') {
      return this.triggerAction === 'hover';
    }
    return this.triggerAction.indexOf('hover') !== -1;
  }

  private clearDelayTimer(): void {
    if (this.delayTimer) {
      clearTimeout(this.delayTimer);
      this.delayTimer = null;
    }
  }

  /** load init data if necessary */
  private beforeVisible(): void {
    this.loadRootOptions();
  }

  private loadRootOptions(): void {
    if (!this.columns.length) {
      const root: any = {};
      this.loadChildren(root, -1);
    }
  }

  /**
   * 设置某列的激活的菜单选项
   *
   * @param option 菜单选项
   * @param index  选项所在的列组的索引
   * @param select 是否触发选择结点
   */
  private setActiveOption(option: CascaderOption, index: number, select: boolean = false,
                          loadChildren: boolean                                  = true): void {
    if (!option || option.disabled) {
      return;
    }

    this.activatedOptions[index] = option;

    // 当直接选择最后一级时，前面的选项要补全。例如，选择“城市”，则自动补全“国家”、“省份”
    for (let i = index - 1; i >= 0; i--) {
      if (!this.activatedOptions[i]) {
        this.activatedOptions[i] = this.activatedOptions[i + 1].parent;
      }
    }
    // 截断多余的选项，如选择“省份”，则只会有“国家”、“省份”，去掉“城市”、“区县”
    if (index < this.activatedOptions.length - 1) {
      this.activatedOptions = this.activatedOptions.slice(0, index + 1);
    }

    // load children
    if ((index + 1 < this.maxColumn)) {
      if (option.children && option.children.length) {
        option.isLeaf = false;
        option.children.forEach(child => child.parent = option);
        this.setColumnData(option.children, index + 1);
      } else if (!option.isLeaf && loadChildren) {
        this.loadChildren(option, index);
      } else {
        // clicking leaf node will remove any children columns
        if (index < this.columns.length - 1) {
          this.columns = this.columns.slice(0, index + 1);
        }
      }
    } else {
      option.isLeaf = true;
    }

    // trigger select event, and display label
    if (select) {
      this.onSelectOption(option, index);
    }

    if (this.overlayDir.overlayRef) {
      setTimeout(() => {
        this.overlayDir.overlayRef.updatePosition();
      });
    }
  }

  private loadChildren(option: CascaderOption, index: number, success?: () => void,
                       failure?: () => void): void {
    if (this.loadData) {
      this.isLoading = index < 0;
      option.loading = true;
      this.loadData(option, index).then(() => {
        option.loading = this.isLoading = false;
        if (option.children) {
          option.children.forEach(child => child.parent = index < 0 ? undefined : option);
          this.setColumnData(option.children, index + 1);
        }
        if (success) {
          success();
        }
      }, () => {
        option.loading = this.isLoading = false;
        option.isLeaf  = true;
        if (failure) {
          failure();
        }
      });
    }
  }

  private onSelectOption(option: CascaderOption, index: number): void {
    // trigger `selectEvent` event
    this.selectEvent.emit({option, index});

    // 生成显示
    if (option.isLeaf || this.changeOnSelect || this.isChangeOn(option, index)) {
      this.selectedOptions = this.activatedOptions;
      // 设置当前控件的显示值
      this.buildDisplayLabel();
      // 触发变更事件
      this.onValueChange();
    }

    // close menu if click on leaf
    if (option.isLeaf) {
      this.delaySetMenuVisible(false, this.mouseLeaveDelay);
    }
  }

  /** 由用户来定义点击后是否变更 */
  private isChangeOn(option: CascaderOption, index: number): boolean {
    if (typeof this.changeOn === 'function') {
      return this.changeOn(option, index) === true;
    }
    return false;
  }

  private setColumnData(options: CascaderOption[], index: number): void {
    if (!arrayEquals(this.columns[index], options) && index < this.maxColumn) {
      this.columns[index] = options;
      if (index < this.columns.length - 1) {
        this.columns = this.columns.slice(0, index + 1);
      }
    }
  }

  /** 按下回车键时选择 */
  private onEnter(): void {
    const columnIndex  = Math.max(this.activatedOptions.length - 1, 0);
    const activeOption = this.activatedOptions[columnIndex];
    if (activeOption && !activeOption.disabled) {
      if (this.inSearch) {
        this.setSearchActiveOption(activeOption as CascaderSearchOption, null);
      } else {
        this.onSelectOption(activeOption, columnIndex);
      }
    }
  }

  /**
   * press `up` or `down` arrow to activate the sibling option.
   */
  private moveUpOrDown(isUp: boolean): void {
    const columnIndex  = Math.max(this.activatedOptions.length - 1, 0);
    // 该组中已经被激活的选项
    const activeOption = this.activatedOptions[columnIndex];
    // 该组所有的选项，用于遍历获取下一个被激活的选项
    const options      = this.columns[columnIndex] || [];
    const length       = options.length;
    let nextIndex      = -1;
    if (!activeOption) { // 该列还没有选中的选项
      nextIndex = isUp ? length : -1;
    } else {
      nextIndex = options.indexOf(activeOption);
    }

    while (true) {
      nextIndex = isUp ? nextIndex - 1 : nextIndex + 1;
      if (nextIndex < 0 || nextIndex >= length) {
        break;
      }
      const nextOption = options[nextIndex];
      if (!nextOption || nextOption.disabled) {
        continue;
      }
      this.setActiveOption(nextOption, columnIndex);
      break;
    }
  }

  private moveUp(): void {
    this.moveUpOrDown(true);
  }

  private moveDown(): void {
    this.moveUpOrDown(false);
  }

  /**
   * press `left` arrow to remove the last selected option.
   */
  private moveLeft(): void {
    const options = this.activatedOptions;
    if (options.length) {
      options.pop(); // Remove the last one
    }
  }

  /**
   * press `right` arrow to select the next column option.
   */
  private moveRight(): void {
    const length  = this.activatedOptions.length;
    const options = this.columns[length];
    if (options && options.length) {
      const nextOpt = options.find(o => !o.disabled);
      if (nextOpt) {
        this.setActiveOption(nextOpt, length);
      }
    }
  }

  private clearDelaySelectTimer(): void {
    if (this.delaySelectTimer) {
      clearTimeout(this.delaySelectTimer);
      this.delaySelectTimer = null;
    }
  }

  private delaySelect(option: CascaderOption, index: number, doSelect: boolean): void {
    this.clearDelaySelectTimer();
    if (doSelect) {
      this.delaySelectTimer = setTimeout(() => {
        this.setActiveOption(option, index, true);
        this.delaySelectTimer = null;
      }, 150);
    }
  }

  private onValueChange(): void {
    const value      = this.getSubmitValue();
    const modelValue = this.valueFormatter();
    if (!arrayEquals(this.value, value)) {
      this.defaultValue = null; // clear the init-value
      this.value        = value;
      this.onChange(modelValue); // Angular need this
      if (value.length === 0) {
        this.clear.emit(); // first trigger `clear` and then `change`
      }
      this.selectionChange.emit(this.selectedOptions);
      this.change.emit(modelValue);
    }
  }

  private findOption(option: any, index: number): CascaderOption {
    const options: CascaderOption[] = this.columns[index];
    if (options) {
      const value = typeof option === 'object' ? this.getOptionValue(option) : option;
      return options.find(o => value === this.getOptionValue(o));
    }
    return null;
  }

  private isLoaded(index: number): boolean {
    return this.columns[index] && this.columns[index].length > 0;
  }

  private activateOnInit(index: number, value: any): void {
    let option = this.findOption(value, index);
    if (!option) {
      option = typeof value === 'object' ? value : {
        [`${this.valueProperty || 'value'}`]: value,
        [`${this.labelProperty || 'label'}`]: value
      };
    }
    this.setActiveOption(option, index, false, false);
  }

  private initOptions(index: number): void {
    const vs   = this.defaultValue;
    const load = () => {
      this.activateOnInit(index, vs[index]);
      if (index < vs.length - 1) {
        this.initOptions(index + 1);
      }
      if (index === vs.length - 1) {
        this.afterWriteValue();
      }
    };

    if (this.isLoaded(index) || !this.loadData) {
      load();
    } else {
      const node = this.activatedOptions[index - 1] || {};
      this.loadChildren(node, index - 1, load, this.afterWriteValue);
    }
  }

  private prepareSearchValue(): void {
    const results: CascaderSearchOption[]                                                  = [];
    const path: CascaderOption[]                                                           = [];
    const defaultFilter                                                                    = (inputValue: string,
                                                                                              p: CascaderOption[]): boolean => {
      let flag = false;
      p.forEach(n => {
        if (n.label.indexOf(inputValue) > -1) {
          flag = true;
        }
      });
      return flag;
    };
    const filter: (inputValue: string, p: CascaderOption[]) => boolean                     =
            this.showSearch instanceof Object && (this.showSearch as ShowSearchOptions).filter ?
              (this.showSearch as ShowSearchOptions).filter :
              defaultFilter;
    const sorter: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number =
            this.showSearch instanceof Object && (this.showSearch as ShowSearchOptions).sorter;
    const loopParent                                                                       = (node: CascaderOption,
                                                                                              forceDisabled = false) => {
      const disabled = forceDisabled || node.disabled;
      path.push(node);
      node.children.forEach((sNode) => {
        if (!sNode.parent) {
          sNode.parent = node;
        }
        /** 搜索的同时建立 parent 连接，因为用户直接搜索的话是没有建立连接的，会提升从叶子节点回溯的难度 */
        if (!sNode.isLeaf) {
          loopParent(sNode, disabled);
        }
        if (sNode.isLeaf || !sNode.children) {
          loopChild(sNode, disabled);
        }
      });
      path.pop();
    };
    const loopChild                                                                        = (node: CascaderOption,
                                                                                              forceDisabled = false) => {
      path.push(node);
      const cPath = Array.from(path);
      if (filter(this._inputValue, cPath)) {
        const disabled = forceDisabled || node.disabled;
        results.push({
          disabled,
          isLeaf: true,
          path  : cPath,
          label : cPath.map(p => p.label).join(' / ')
        } as CascaderSearchOption);
      }
      path.pop();
    };

    this.oldColumnsHolder[0].forEach((node: any) => loopParent(node));
    if (sorter) {
      results.sort((a, b) => sorter(a.path, b.path, this._inputValue));
    }
    this.columns = [results];
  }
}
