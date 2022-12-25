import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchFakeEvent } from '@gradii/triangle/core/testing';
import { Subject } from 'rxjs';
import { TriSelectModule } from '../src/select';
import { SelectTopControlComponent } from '../src/select/select-top-control.component';
import { SelectService } from '../src/select/select.service';
import { createListOfOption } from './option-container.spec';

describe('tri-select top control', () => {
  beforeEach(fakeAsync(() => {
    let selectServiceStub: Partial<SelectService>;
    selectServiceStub = {
      check$                    : new Subject(),
      listOfSelectedValue$      : new Subject(),
      open$                     : new Subject(),
      clearInput$               : new Subject(),
      listOfSelectedValue       : [1, 2, 3],
      listOfCachedSelectedOption: createListOfOption(10),
      isMultipleOrTags          : true,
      removeValueFormSelected   : () => {
      },
      tokenSeparate             : () => {
      },
      updateSearchValue         : () => {
      },
      updateListOfSelectedValue : () => {
      },
      compareWith               : (o1, o2) => o1 === o2
    };
    TestBed.configureTestingModule({
      providers   : [{provide: SelectService, useValue: selectServiceStub}],
      imports     : [TriSelectModule, NoopAnimationsModule],
      declarations: [TestSelectTopControlComponent]
    });
    TestBed.compileComponents();
  }));
  describe('default', () => {
    let fixture: ComponentFixture<TestSelectTopControlComponent>;
    let testComponent: TestSelectTopControlComponent;
    let tc: DebugElement;
    let tcComponent: SelectTopControlComponent;
    let selectService: SelectService;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectTopControlComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      tc = fixture.debugElement.query(By.directive(SelectTopControlComponent));
      tcComponent = tc.injector.get(SelectTopControlComponent);
      selectService = fixture.debugElement.injector.get(SelectService);
    });
    it('should clear selection work', () => {
      fixture.detectChanges();
      const clearSpy = spyOn(selectService, 'updateListOfSelectedValue');
      fixture.detectChanges();
      expect(clearSpy).toHaveBeenCalledTimes(0);
      dispatchFakeEvent(tc.nativeElement.querySelector('.tri-select-selection__clear'), 'click');
      fixture.detectChanges();
      expect(clearSpy).toHaveBeenCalledTimes(1);
    });
    it('should setInputValue work', () => {
      fixture.detectChanges();
      const setInputSpy = spyOn(tcComponent, 'setInputValue');
      fixture.detectChanges();
      expect(setInputSpy).toHaveBeenCalledTimes(0);
      selectService.clearInput$.next();
      fixture.detectChanges();
      expect(setInputSpy).toHaveBeenCalledTimes(1);
      expect(setInputSpy).toHaveBeenCalledWith('');
    });
    it('should input work', fakeAsync(() => {
      fixture.detectChanges();
      const inputEl = tc.nativeElement.querySelector('.tri-select-search__field');
      inputEl.value = 'test';
      dispatchFakeEvent(inputEl, 'input');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(Math.floor(inputEl.scrollWidth / 10)).toBe(Math.floor(parseInt(inputEl.style.width, 10) / 10));
      inputEl.value = '';
      dispatchFakeEvent(inputEl, 'input');
      fixture.detectChanges();
      flush();
      fixture.detectChanges();
      expect(inputEl.style.width).toBe('');
    }));
    it('should selectedValueDisplay', () => {
      fixture.detectChanges();
      tcComponent.showSearch = false;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('block');
      expect(tcComponent.selectedValueStyle.opacity).toBe('1');
      tcComponent.showSearch = true;
      tcComponent.open = false;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('block');
      expect(tcComponent.selectedValueStyle.opacity).toBe('1');
      tcComponent.showSearch = true;
      tcComponent.open = true;
      // @ts-ignore
      tcComponent.inputValue = true;
      tcComponent.isComposing = true;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('none');
      expect(tcComponent.selectedValueStyle.opacity).toBe('1');
      tcComponent.showSearch = true;
      tcComponent.open = true;
      // @ts-ignore
      tcComponent.inputValue = true;
      tcComponent.isComposing = false;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('none');
      expect(tcComponent.selectedValueStyle.opacity).toBe('1');
      tcComponent.showSearch = true;
      tcComponent.open = true;
      // @ts-ignore
      tcComponent.inputValue = false;
      tcComponent.isComposing = true;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('none');
      expect(tcComponent.selectedValueStyle.opacity).toBe('1');
      tcComponent.showSearch = true;
      tcComponent.open = true;
      // @ts-ignore
      tcComponent.inputValue = false;
      tcComponent.isComposing = false;
      fixture.detectChanges();
      expect(tcComponent.selectedValueStyle.display).toBe('block');
      expect(tcComponent.selectedValueStyle.opacity).toBe('0.4');
    });
    it('should open focus', () => {
      fixture.detectChanges();
      expect(tc.nativeElement.querySelector('.tri-select-search__field') === document.activeElement).toBeFalsy();
      // @ts-ignore
      selectService.open$.next(false);
      fixture.detectChanges();
      expect(tc.nativeElement.querySelector('.tri-select-search__field') === document.activeElement).toBeFalsy();
      // @ts-ignore
      selectService.open$.next(true);
      fixture.detectChanges();
      expect(tc.nativeElement.querySelector('.tri-select-search__field') === document.activeElement).toBeTruthy();
    });
    it('should destroy piped', () => {
      fixture.detectChanges();
      // @ts-ignore
      const checkSpy = spyOn(tcComponent.cdr, 'markForCheck');
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(0);
      // @ts-ignore
      selectService.check$.next();
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
      testComponent.destroy = true;
      fixture.detectChanges();
      // @ts-ignore
      selectService.check$.next();
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
    });
    it('should remove option call', () => {
      fixture.detectChanges();
      const removeSpy = spyOn(selectService, 'removeValueFormSelected');
      fixture.detectChanges();
      expect(removeSpy).toHaveBeenCalledTimes(0);
      dispatchFakeEvent(tc.nativeElement.querySelector('.tri-select-selection__choice__remove'), 'click');
      fixture.detectChanges();
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });
  });
});

@Component({
  template: `
    <div
      tri-select-top-control
      *ngIf="!destroy"
      [open]="open"
      [maxTagPlaceholder]="maxTagPlaceholder"
      [placeHolder]="placeHolder"
      [allowClear]="allowClear"
      [maxTagCount]="maxTagCount"
      [showArrow]="showArrow"
      [loading]="loading"
      [suffixIcon]="suffixIcon"
      [clearIcon]="clearIcon"
      [removeIcon]="removeIcon"
      [showSearch]="showSearch"
      [tokenSeparators]="tokenSeparators"
    ></div>
    <ng-template #maxTagPlaceholder>maxTagPlaceholder</ng-template>
    <ng-template #suffixIcon>suffixIcon</ng-template>
    <ng-template #clearIcon>clearIcon</ng-template>
    <ng-template #removeIcon>removeIcon</ng-template>
  `
})
export class TestSelectTopControlComponent {
  destroy = false;
  open = false;
  placeHolder = 'placeholder';
  allowClear = true;
  maxTagCount = 3;
  showArrow = true;
  loading = false;
  showSearch = false;
  tokenSeparators = [','];
}
