/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BACKSPACE, DOWN_ARROW, ENTER, SPACE, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { isBlank, isPresent } from '@gradii/triangle/util';
import { BehaviorSubject, combineLatest, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, share, skip, tap } from 'rxjs/operators';
import { OptionGroupComponent } from './option-group.component';
import { OptionComponent } from './option.component';
import { defaultFilterOption, FilterOptionPipe, TFilterOption } from './option.pipe';

@Injectable()
export class SelectService {
  // Input params
  autoClearSearchValue = true;
  serverSearch = false;
  filterOption: TFilterOption = defaultFilterOption;
  mode: 'default' | 'multiple' | 'tags' = 'default';
  maxMultipleCount = Infinity;
  disabled = false;
  clearInput$ = new Subject<boolean>();
  // selectedValueChanged should emit ngModelChange or not
  searchValue = '';
  isShowNotFound = false;
  activatedOption: OptionComponent | null;
  activatedOption$ = new ReplaySubject<OptionComponent | null>(1);
  // tslint:disable-next-line:no-any
  listOfSelectedValue: any[] = [];
  // flat ViewChildren
  listOfTemplateOption: OptionComponent[] = [];
  // tag option
  listOfTagOption: OptionComponent[] = [];
  // tag option concat template option
  listOfTagAndTemplateOption: OptionComponent[] = [];
  // ViewChildren
  listOfOptionComponent: OptionComponent[] = [];
  listOfOptionGroupComponent: OptionGroupComponent[] = [];
  // click or enter add tag option
  addedTagOption: OptionComponent | null;
  // display in top control
  listOfCachedSelectedOption: OptionComponent[] = [];
  // tslint:disable-next-line:no-any
  private listOfSelectedValueWithEmit$ = new BehaviorSubject<{ value: any[]; emit: boolean }>({
    value: [],
    emit : false
  });
  listOfSelectedValue$: Observable<any> = this.listOfSelectedValueWithEmit$.pipe(map(data => data.value));
  modelChange$: Observable<any> = this.listOfSelectedValueWithEmit$.pipe(
    filter(item => item.emit),
    map(data => {
      const selectedList = data.value;
      let modelValue: any[] | null = null; // tslint:disable-line:no-any
      if (this.isSingleMode) {
        if (selectedList.length) {
          modelValue = selectedList[0];
        }
      } else {
        modelValue = selectedList;
      }
      return modelValue;
    })
  );
  // ContentChildren Change
  private mapOfTemplateOption$ = new BehaviorSubject<{
    listOfOptionComponent: OptionComponent[];
    listOfOptionGroupComponent: OptionGroupComponent[];
  }>({
    listOfOptionComponent     : [],
    listOfOptionGroupComponent: []
  });
  // selected value or ViewChildren change
  valueOrOption$: Observable<any> = combineLatest(this.listOfSelectedValue$, this.mapOfTemplateOption$).pipe(
    tap(data => {
      this.listOfSelectedValue = data[0];
      this.listOfOptionComponent = data[1].listOfOptionComponent;
      this.listOfOptionGroupComponent = data[1].listOfOptionGroupComponent;
      this.listOfTemplateOption = this.listOfOptionComponent.concat(
        this.listOfOptionGroupComponent.reduce(
          (pre, cur) => [...pre, ...cur.listOfOptionComponent.toArray()],
          [] as OptionComponent[]
        )
      );
      this.updateListOfTagOption();
      this.updateListOfFilteredOption();
      this.resetActivatedOptionIfNeeded();
      this.updateListOfCachedOption();
    }),
    share()
  );
  // searchValue Change
  private searchValueRaw$ = new BehaviorSubject<string>('');
  private listOfFilteredOption: OptionComponent[] = [];
  searchValue$: Observable<any> = this.searchValueRaw$.pipe(
    distinctUntilChanged(),
    skip(1),
    share(),
    tap(value => {
      this.searchValue = value;
      if (value) {
        this.updateActivatedOption(this.listOfFilteredOption[0]);
      }
      this.updateListOfFilteredOption();
    })
  );
  private openRaw$ = new Subject<boolean>();
  // open
  open$: Observable<any> = this.openRaw$.pipe(
    distinctUntilChanged(),
    share(),
    tap(() => this.clearInput())
  );

  private checkRaw$: Subject<any> = new Subject();

  check$ = merge(
    this.checkRaw$,
    this.valueOrOption$,
    this.searchValue$,
    this.activatedOption$,
    this.open$,
    this.modelChange$
  ).pipe(share());
  private open = false;

  get isSingleMode(): boolean {
    return this.mode === 'default';
  }

  get isTagsMode(): boolean {
    return this.mode === 'tags';
  }

  get isMultipleMode(): boolean {
    return this.mode === 'multiple';
  }

  get isMultipleOrTags(): boolean {
    return this.mode === 'tags' || this.mode === 'multiple';
  }

  // tslint:disable-next-line:no-any
  compareWith = (o1: any, o2: any) => o1 === o2;

  clickOption(option: OptionComponent): void {
    /** update listOfSelectedOption -> update listOfSelectedValue -> next listOfSelectedValue$ **/
    if (!option.disabled) {
      this.updateActivatedOption(option);
      let listOfSelectedValue = [...this.listOfSelectedValue];
      if (this.isMultipleOrTags) {
        const targetValue = listOfSelectedValue.find(o => this.compareWith(o, option.value));
        if (isPresent(targetValue)) {
          listOfSelectedValue.splice(listOfSelectedValue.indexOf(targetValue), 1);
          this.updateListOfSelectedValue(listOfSelectedValue, true);
        } else if (listOfSelectedValue.length < this.maxMultipleCount) {
          listOfSelectedValue.push(option.value);
          this.updateListOfSelectedValue(listOfSelectedValue, true);
        }
      } else if (!this.compareWith(listOfSelectedValue[0], option.value)) {
        listOfSelectedValue = [option.value];
        this.updateListOfSelectedValue(listOfSelectedValue, true);
      }
      if (this.isSingleMode) {
        this.setOpenState(false);
      } else if (this.autoClearSearchValue) {
        this.clearInput();
      }
    }
  }

  updateListOfCachedOption(): void {
    if (this.isSingleMode) {
      const selectedOption = this.listOfTemplateOption.find(o =>
        this.compareWith(o.value, this.listOfSelectedValue[0])
      );
      if (!isBlank(selectedOption)) {
        // @ts-ignore
        this.listOfCachedSelectedOption = [selectedOption];
      }
    } else {
      const listOfCachedSelectedOption: OptionComponent[] = [];
      this.listOfSelectedValue.forEach(v => {
        const listOfMixedOption = [...this.listOfTagAndTemplateOption, ...this.listOfCachedSelectedOption];
        const option = listOfMixedOption.find(o => this.compareWith(o.value, v));
        if (option) {
          listOfCachedSelectedOption.push(option);
        }
      });
      this.listOfCachedSelectedOption = listOfCachedSelectedOption;
    }
  }

  updateListOfTagOption(): void {
    if (this.isTagsMode) {
      const listOfMissValue = this.listOfSelectedValue.filter(
        value => !this.listOfTemplateOption.find(o => this.compareWith(o.value, value))
      );
      this.listOfTagOption = listOfMissValue.map(value => {
        const optionComponent = new OptionComponent();
        optionComponent.value = value;
        optionComponent.label = value;
        return optionComponent;
      });
      this.listOfTagAndTemplateOption = [...this.listOfTemplateOption.concat(this.listOfTagOption)];
    } else {
      this.listOfTagAndTemplateOption = [...this.listOfTemplateOption];
    }
  }

  updateAddTagOption(): void {
    const isMatch = this.listOfTagAndTemplateOption.find(item => item.label === this.searchValue);
    if (this.isTagsMode && this.searchValue && !isMatch) {
      const option = new OptionComponent();
      option.value = this.searchValue;
      option.label = this.searchValue;
      this.addedTagOption = option;
      this.updateActivatedOption(option);
    } else {
      this.addedTagOption = null;
    }
  }

  updateListOfFilteredOption(): void {
    this.updateAddTagOption();
    const listOfFilteredOption = new FilterOptionPipe().transform(
      this.listOfTagAndTemplateOption,
      this.searchValue,
      this.filterOption,
      this.serverSearch
    );
    // @ts-ignore
    this.listOfFilteredOption = this.addedTagOption ? [this.addedTagOption, ...listOfFilteredOption] : [...listOfFilteredOption];
    this.isShowNotFound = !this.isTagsMode && !this.listOfFilteredOption.length;
  }

  clearInput(): void {
    this.clearInput$.next();
  }

  // tslint:disable-next-line:no-any
  updateListOfSelectedValue(value: any[], emit: boolean): void {
    this.listOfSelectedValueWithEmit$.next({value, emit});
  }

  updateActivatedOption(option: OptionComponent | null): void {
    this.activatedOption$.next(option);
    this.activatedOption = option;
  }

  tokenSeparate(inputValue: string, tokenSeparators: string[]): void {
    // auto tokenSeparators
    if (
      inputValue &&
      inputValue.length &&
      tokenSeparators.length &&
      this.isMultipleOrTags &&
      this.includesSeparators(inputValue, tokenSeparators)
    ) {
      const listOfLabel = this.splitBySeparators(inputValue, tokenSeparators);
      this.updateSelectedValueByLabelList(listOfLabel);
      this.clearInput();
    }
  }

  includesSeparators(str: string | string[], separators: string[]): boolean {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < separators.length; ++i) {
      if (str.lastIndexOf(separators[i]) > 0) {
        return true;
      }
    }
    return false;
  }

  splitBySeparators(str: string | string[], separators: string[]): string[] {
    const reg = new RegExp(`[${separators.join()}]`);
    const array = (str as string).split(reg).filter(token => token);
    return Array.from(new Set(array));
  }

  resetActivatedOptionIfNeeded(): void {
    const resetActivatedOption = () => {
      const activatedOption = this.listOfFilteredOption.find(item =>
        this.compareWith(item.value, this.listOfSelectedValue[0])
      );
      this.updateActivatedOption(activatedOption || null);
    };
    if (this.activatedOption) {
      if (
        !this.listOfFilteredOption.find(item => this.compareWith(item.value, this.activatedOption!.value)) ||
        !this.listOfSelectedValue.find(item => this.compareWith(item, this.activatedOption!.value))
      ) {
        resetActivatedOption();
      }
    } else {
      resetActivatedOption();
    }
  }

  updateTemplateOption(
    listOfOptionComponent: OptionComponent[],
    listOfOptionGroupComponent: OptionGroupComponent[]
  ): void {
    this.mapOfTemplateOption$.next({listOfOptionComponent, listOfOptionGroupComponent});
  }

  updateSearchValue(value: string): void {
    this.searchValueRaw$.next(value);
  }

  updateSelectedValueByLabelList(listOfLabel: string[]): void {
    const listOfSelectedValue = [...this.listOfSelectedValue];
    const listOfMatchOptionValue = this.listOfTagAndTemplateOption
      .filter(item => listOfLabel.indexOf(item.label) !== -1)
      .map(item => item.value)
      .filter(item => !isPresent(this.listOfSelectedValue.find(v => this.compareWith(v, item))));
    if (this.isMultipleMode) {
      this.updateListOfSelectedValue([...listOfSelectedValue, ...listOfMatchOptionValue], true);
    } else {
      const listOfUnMatchOptionValue = listOfLabel.filter(
        label => this.listOfTagAndTemplateOption.map(item => item.label).indexOf(label) === -1
      );
      this.updateListOfSelectedValue(
        [...listOfSelectedValue, ...listOfMatchOptionValue, ...listOfUnMatchOptionValue],
        true
      );
    }
  }

  onKeyDown(e: KeyboardEvent): void {
    const keyCode = e.keyCode;
    const eventTarget = e.target as HTMLInputElement;
    const listOfFilteredOptionWithoutDisabled = this.listOfFilteredOption.filter(item => !item.disabled);
    const activatedIndex = listOfFilteredOptionWithoutDisabled.findIndex(item => item === this.activatedOption);
    switch (keyCode) {
      case UP_ARROW:
        e.preventDefault();
        const preIndex = activatedIndex > 0 ? activatedIndex - 1 : listOfFilteredOptionWithoutDisabled.length - 1;
        this.updateActivatedOption(listOfFilteredOptionWithoutDisabled[preIndex]);
        break;
      case DOWN_ARROW:
        e.preventDefault();
        const nextIndex = activatedIndex < listOfFilteredOptionWithoutDisabled.length - 1 ? activatedIndex + 1 : 0;
        this.updateActivatedOption(listOfFilteredOptionWithoutDisabled[nextIndex]);
        if (!this.disabled && !this.open) {
          this.setOpenState(true);
        }
        break;
      case ENTER:
        e.preventDefault();
        if (this.open) {
          if (this.activatedOption && !this.activatedOption.disabled) {
            this.clickOption(this.activatedOption);
          }
        } else {
          this.setOpenState(true);
        }
        break;
      case BACKSPACE:
        if (this.isMultipleOrTags && !eventTarget.value && this.listOfCachedSelectedOption.length) {
          e.preventDefault();
          this.removeValueFormSelected(this.listOfCachedSelectedOption[this.listOfCachedSelectedOption.length - 1]);
        }
        break;
      case SPACE:
        if (!this.disabled && !this.open) {
          this.setOpenState(true);
          e.preventDefault();
        }
        break;
      case TAB:
        this.setOpenState(false);
        break;
    }
  }

  // tslint:disable-next-line:no-any
  removeValueFormSelected(option: OptionComponent): void {
    if (this.disabled || option.disabled) {
      return;
    }
    const listOfSelectedValue = this.listOfSelectedValue.filter(item => !this.compareWith(item, option.value));
    this.updateListOfSelectedValue(listOfSelectedValue, true);
    this.clearInput();
  }

  setOpenState(value: boolean): void {
    this.openRaw$.next(value);
    this.open = value;
  }

  check(): void {
    this.checkRaw$.next();
  }
}
