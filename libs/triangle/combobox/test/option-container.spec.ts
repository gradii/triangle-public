import { Component, DebugElement, QueryList, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchFakeEvent } from '@gradii/triangle/core/testing';
import { ReplaySubject, Subject } from 'rxjs';
import {
  OptionComponent,
  OptionContainerComponent,
  OptionGroupComponent,
  TriSelectModule
} from '../src/select';
import { defaultFilterOption } from '../src/select/option.pipe';
import { SelectService } from '../src/select/select.service';

export const createListOfOption = (count: number, prefix = 'option') => {
  const list: OptionComponent[] = [];
  for (let i = 0; i < count; i++) {
    const option = new OptionComponent();
    option.value = `${prefix}_value_${i}`;
    option.label = `${prefix}_label_${i}`;
    list.push(option);
  }
  return list;
};

export const createListOfGroupOption = (groupCount: number, optionCount: number) => {
  const list: OptionGroupComponent[] = [];
  for (let i = 0; i < groupCount; i++) {
    const queryList = new QueryList<OptionComponent>();
    queryList.reset(createListOfOption(optionCount, `${i}_inner_option`));
    const option = new OptionGroupComponent();
    option.label = `group_label_${i}`;
    option.listOfOptionComponent = queryList;
    list.push(option);
  }
  return list;
};

describe('tri-select option container', () => {
  beforeEach(fakeAsync(() => {
    let selectServiceStub: Partial<SelectService>;
    selectServiceStub = {
      searchValue               : '',
      filterOption              : defaultFilterOption,
      serverSearch              : false,
      listOfOptionComponent     : createListOfOption(20),
      check$                    : new Subject(),
      activatedOption$          : new ReplaySubject(1),
      listOfOptionGroupComponent: createListOfGroupOption(10, 10),
      listOfSelectedValue$      : new Subject(),
      compareWith               : (o1, o2) => o1 === o2
    };
    TestBed.configureTestingModule({
      imports     : [TriSelectModule, NoopAnimationsModule],
      providers   : [{provide: SelectService, useValue: selectServiceStub}],
      declarations: [OptionContainerSpecComponent]
    });
    TestBed.compileComponents();
  }));
  describe('default', () => {
    let fixture: ComponentFixture<OptionContainerSpecComponent>;
    let testComponent: OptionContainerSpecComponent;
    let oc: DebugElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(OptionContainerSpecComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      oc = fixture.debugElement.query(By.directive(OptionContainerComponent));
    });
    it('should scrollToBottom emit', () => {
      fixture.detectChanges();
      expect(testComponent.scrollToBottom).toHaveBeenCalledTimes(0);
      const ul = oc.injector.get(OptionContainerComponent).dropdownUl.nativeElement;
      ul.scrollTop = ul.scrollHeight - ul.clientHeight;
      dispatchFakeEvent(ul, 'scroll');
      fixture.detectChanges();
      expect(testComponent.scrollToBottom).toHaveBeenCalledTimes(1);
    });
    it('should scrollIntoViewIfNeeded', fakeAsync(() => {
      fixture.detectChanges();
      const selectService = fixture.debugElement.injector.get(SelectService);
      selectService.activatedOption$.next(
        selectService.listOfOptionComponent[selectService.listOfOptionComponent.length - 1]
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      const ul = oc.injector.get(OptionContainerComponent).dropdownUl.nativeElement;
      expect(ul.scrollTop).toBeGreaterThan(0);
    }));
    it('should destroy piped', () => {
      fixture.detectChanges();
      const checkSpy = spyOn(Reflect.get(oc.injector.get(OptionContainerComponent), 'cdr'), 'markForCheck');
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(0);
      const selectService = fixture.debugElement.injector.get(SelectService);
      // TODO: observable does not have next method.
      (selectService.check$ as any).next(); // tslint:disable-line:no-any
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
      testComponent.destroy = true;
      fixture.detectChanges();
      (selectService.check$ as any).next(); // tslint:disable-line:no-any
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
    });
  });
});

@Component({
  template     : `
    <div
      tri-option-container
      *ngIf="!destroy"
      [menuItemSelectedIcon]="iconTemplate"
      [notFoundContent]="notFoundContent"
      (scrollToBottom)="scrollToBottom($event)"
    ></div>
    <ng-template #iconTemplate>icon</ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
  // styleUrls    : ['../style/index.less', './style/index.less']
})
export class OptionContainerSpecComponent {
  destroy = false;
  scrollToBottom = jasmine.createSpy('scrollToBottom callback');
  notFoundContent = 'not found';
}
