import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@gradii/triangle/core/testing';
import { OptionComponent } from '@gradii/triangle/inputs';
import { ReplaySubject, Subject } from 'rxjs';
import { OptionLiComponent } from '../src/select/option-li.component';
import { SelectService } from '../src/select/select.service';

describe('select option li', () => {
  beforeEach(fakeAsync(() => {
    let selectServiceStub: Partial<SelectService>;
    selectServiceStub = {
      activatedOption$    : new ReplaySubject(1),
      listOfSelectedValue$: new Subject(),
      compareWith         : (o1, o2) => o1 === o2,
      clickOption         : () => {
      }
    };
    TestBed.configureTestingModule({
      providers   : [{provide: SelectService, useValue: selectServiceStub}],
      declarations: [TestSelectOptionLiComponent, OptionLiComponent]
    });
    TestBed.compileComponents();
  }));
  describe('default', () => {
    let fixture: ComponentFixture<TestSelectOptionLiComponent>;
    let testComponent: TestSelectOptionLiComponent;
    let li: DebugElement;
    let liComponent: OptionLiComponent;
    let selectService: SelectService;
    beforeEach(() => {
      fixture = TestBed.createComponent(TestSelectOptionLiComponent);
      fixture.detectChanges();
      testComponent = fixture.debugElement.componentInstance;
      li = fixture.debugElement.query(By.directive(OptionLiComponent));
      liComponent = li.injector.get(OptionLiComponent);
      selectService = fixture.debugElement.injector.get(SelectService);
    });
    it('should selected work', () => {
      fixture.detectChanges();
      expect(liComponent.selected).toBe(false);
      // @ts-ignore
      selectService.listOfSelectedValue$.next(['01_value']);
      fixture.detectChanges();
      expect(liComponent.selected).toBe(true);
      // @ts-ignore
      selectService.listOfSelectedValue$.next(['01_label']);
      fixture.detectChanges();
      expect(liComponent.selected).toBe(false);
    });
    it('should active work', () => {
      fixture.detectChanges();
      expect(liComponent.active).toBe(false);
      const option01 = new OptionComponent();
      option01.label = '01_label';
      option01.value = '01_value';
      selectService.activatedOption$.next(option01);
      fixture.detectChanges();
      expect(liComponent.active).toBe(true);
      selectService.activatedOption$.next(null);
      fixture.detectChanges();
      expect(liComponent.active).toBe(false);
    });
    it('should destroy piped', () => {
      fixture.detectChanges();
      // @ts-ignore
      const checkSpy = spyOn(liComponent.cdr, 'markForCheck');
      expect(checkSpy).toHaveBeenCalledTimes(0);
      // @ts-ignore
      selectService.listOfSelectedValue$.next(['01_value']);
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
      testComponent.destroy = true;
      fixture.detectChanges();
      // @ts-ignore
      selectService.listOfSelectedValue$.next(['01_value']);
      fixture.detectChanges();
      expect(checkSpy).toHaveBeenCalledTimes(1);
    });
    it('should host click trigger', () => {
      fixture.detectChanges();
      const clickSpy = spyOn(selectService, 'clickOption');
      fixture.detectChanges();
      expect(clickSpy).toHaveBeenCalledTimes(0);
      dispatchFakeEvent(li.nativeElement, 'click');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });
});

@Component({
  template: `
    <li tri-option-li *ngIf="!destroy" [option]="option" [menuItemSelectedIcon]="icon"></li>
    <ng-template #icon>icon</ng-template>
  `
})
export class TestSelectOptionLiComponent {
  option = new OptionComponent();
  destroy = false;

  constructor() {
    this.option.label = '01_label';
    this.option.value = '01_value';
  }
}
