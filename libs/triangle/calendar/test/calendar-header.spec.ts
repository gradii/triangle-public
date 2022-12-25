import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarHeaderComponent } from '@gradii/triangle/calendar';
import { TriI18nModule } from '@gradii/triangle/i18n';
import { RadioGroupComponent as RadioGroup, TriRadioModule, } from '@gradii/triangle/radio';
import { SelectComponent, TriSelectModule } from '@gradii/triangle/select';

registerLocaleData(zh);

describe('calendar header', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports     : [
        FormsModule,
        TriI18nModule,
        TriRadioModule,
        TriSelectModule,
        NoopAnimationsModule
      ],
      declarations: [
        CalendarHeaderComponent,
        TestCalendarHeaderModeComponent,
        TestCalendarHeaderFullscreenComponent,
        TestCalendarHeaderActiveDateComponent,
        TestCalendarHeaderChangesComponent
      ]
    }).compileComponents();
  }));

  describe('mode', () => {
    let fixture: ComponentFixture<TestCalendarHeaderModeComponent>;
    let component: TestCalendarHeaderModeComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarHeaderModeComponent);
      component = fixture.componentInstance;
    }));

    it('should be month by default', () => {
      fixture.detectChanges();

      const modeNgModel = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[0]
        .query(By.directive(RadioGroup)).injector.get(NgModel);
      expect(modeNgModel.model).toBe('month');
    });

    it('should update mode passed in', () => {
      component.mode = 'year';

      fixture.detectChanges();

      const modeNgModel = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[1]
        .query(By.directive(RadioGroup)).injector.get(NgModel);
      expect(modeNgModel.model).toBe('year');
    });

    it('should emit change event for mode selection', () => {
      const modeNgModel = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[1]
        .query(By.directive(RadioGroup)).injector.get(NgModel);
      modeNgModel.viewToModelUpdate('year');

      fixture.detectChanges();

      expect(component.mode).toBe('year');
    });
  });

  describe('fullscreen', () => {
    let fixture: ComponentFixture<TestCalendarHeaderFullscreenComponent>;
    let component: TestCalendarHeaderFullscreenComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarHeaderFullscreenComponent);
      component = fixture.componentInstance;
    }));

    it('should be true by default', () => {
      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[0];
      const [yearSelect, monthSelect] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(SelectComponent));
      const modeRadioGroup = header.query(By.directive(RadioGroup)).injector.get(RadioGroup);

      expect(yearSelect.size).not.toBe('small');
      expect(monthSelect.size).not.toBe('small');
      expect(modeRadioGroup.size).not.toBe('small');
    });

    it('should use small size when not in fullscreen', () => {
      component.fullscreen = false;

      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[1];
      const [yearSelect, monthSelect] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(SelectComponent));
      const modeRadioGroup = header.query(By.directive(RadioGroup)).injector.get(RadioGroup);

      expect(yearSelect.size).toBe('small');
      expect(monthSelect.size).toBe('small');
      expect(modeRadioGroup.size).toBe('small');
    });
  });

  describe('activeDate', () => {
    let fixture: ComponentFixture<TestCalendarHeaderActiveDateComponent>;
    let component: TestCalendarHeaderActiveDateComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarHeaderActiveDateComponent);
      component = fixture.componentInstance;
    }));

    it('should be now by default', () => {
      const now = new Date();

      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[0];
      const [yearModel, monthModel] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(NgModel));

      expect(yearModel.model).toBe(now.getFullYear());
      expect(monthModel.model).toBe(now.getMonth());
    });

    it('should update model binding to passed date', () => {
      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[1];
      const [yearModel, monthModel] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(NgModel));

      expect(yearModel.model).toBe(2001);
      expect(monthModel.model).toBe(1);
    });
  });

  describe('changes', () => {
    let fixture: ComponentFixture<TestCalendarHeaderChangesComponent>;
    let component: TestCalendarHeaderChangesComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarHeaderChangesComponent);
      component = fixture.componentInstance;
    }));

    it('should emit yearChange when year changed', () => {
      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[0];
      const [yearModel] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(NgModel));

      yearModel.viewToModelUpdate(2010);

      fixture.detectChanges();

      expect(component.year).toBe(2010);
    });

    it('should emit monthChange when month changed', () => {
      fixture.detectChanges();
      const header = fixture.debugElement.queryAll(By.directive(CalendarHeaderComponent))[0];
      const [_, monthModel] = header.queryAll(By.directive(SelectComponent)).map(x => x.injector.get(NgModel));

      monthModel.viewToModelUpdate(2);

      fixture.detectChanges();

      expect(component.month).toBe(2);
    });
  });
});

@Component({
  template: `
    <tri-calendar-header></tri-calendar-header>
    <tri-calendar-header [(mode)]="mode"></tri-calendar-header>
  `
})
class TestCalendarHeaderModeComponent {
  mode: 'month' | 'year' = 'month';
}

@Component({
  template: `
    <tri-calendar-header></tri-calendar-header>
    <tri-calendar-header [fullscreen]="fullscreen"></tri-calendar-header>
  `
})
class TestCalendarHeaderFullscreenComponent {
  fullscreen = true;
}

@Component({
  template: `
    <tri-calendar-header></tri-calendar-header>
    <tri-calendar-header [activeDate]="activeDate"></tri-calendar-header>
  `
})
class TestCalendarHeaderActiveDateComponent {
  activeDate = new Date(2001, 1, 3);
}

@Component({
  template: `
    <tri-calendar-header
      (yearChange)="year = $event"
      (monthChange)="month = $event">
    </tri-calendar-header>
  `
})
class TestCalendarHeaderChangesComponent {
  year: number | null = null;
  month: number | null = null;
}
