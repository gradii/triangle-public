import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { Component } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  CalendarComponent as Calendar,
  CalendarHeaderComponent as CalendarHeader,
  TriCalendarModule
} from '@gradii/triangle/calendar';

registerLocaleData(zh);

describe('calendar', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        TriCalendarModule,
        NoopAnimationsModule
      ],
      declarations: [
        TestCalendarModeComponent,
        TestCalendarValueComponent,
        TestCalendarFullscreenComponent,
        TestCalendarDateCellComponent,
        TestCalendarDateFullCellComponent,
        TestCalendarMonthCellComponent,
        TestCalendarMonthFullCellComponent
      ]
    }).compileComponents();
  }));

  describe('mode', () => {
    let fixture: ComponentFixture<TestCalendarModeComponent>;
    let component: TestCalendarModeComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarModeComponent);
      component = fixture.componentInstance;
    }));

    it('should be month by default', () => {
      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(Calendar))[0]
        .query(By.directive(CalendarHeader)).injector.get(CalendarHeader);
      expect(header.mode).toBe('month');
    });

    it('should update mode passed in', () => {
      component.mode = 'year';

      fixture.detectChanges();

      const header = fixture.debugElement.queryAll(By.directive(Calendar))[1]
        .query(By.directive(CalendarHeader)).injector.get(CalendarHeader);
      expect(header.mode).toBe('year');
    });

    it('should emit change event for mode selection', () => {
      const header = fixture.debugElement.queryAll(By.directive(Calendar))[1]
        .query(By.directive(CalendarHeader)).injector.get(CalendarHeader);
      header.modeChange.emit('year');

      fixture.detectChanges();

      expect(component.mode).toBe('year');
    });

    it('should display date grid in month mode', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const table = host.query(By.css('table'));

      expect(table.nativeElement.className).toContain('tri-fullcalendar-table');
    });

    it('should display date grid in year mode', () => {
      component.mode = 'year';
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const table = host.query(By.css('table'));

      expect(table.nativeElement.className).toContain('tri-fullcalendar-month-panel-table');
    });
  });

  describe('value', () => {
    let fixture: ComponentFixture<TestCalendarValueComponent>;
    let component: TestCalendarValueComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarValueComponent);
      component = fixture.componentInstance;
    }));

    it('should be now by default', () => {
      const now = new Date();

      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const header = host.query(By.directive(CalendarHeader)).injector.get(CalendarHeader);

      expect(header.activeDate.getFullYear()).toBe(now.getFullYear());
      expect(header.activeDate.getMonth()).toBe(now.getMonth());
      expect(header.activeDate.getDate()).toBe(now.getDate());
    });

    it('should support two-way binding without model', () => {
      fixture.detectChanges();
      const now = new Date();

      const calendar = fixture.debugElement.queryAll(By.directive(Calendar))[1].injector.get(Calendar);

      expect(calendar.activeDate).toBe(component.date0);

      calendar.onDateSelect(now);
      fixture.detectChanges();

      expect(component.date0).toBe(now);
    });

    it('should support model binding', fakeAsync(() => {
      fixture.detectChanges();
      const now = new Date();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[2];
      const calendar = host.injector.get(Calendar);
      const model = host.injector.get(NgModel);
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(calendar.activeDate).toBe(component.date1);

      model.viewToModelUpdate(now);
      fixture.detectChanges();

      expect(component.date1).toBe(now);
    }));

    it('should update value when year changed', () => {
      fixture.detectChanges();
      const calendar = fixture.debugElement.queryAll(By.directive(Calendar))[1].injector.get(Calendar);
      calendar.onYearSelect(2010);
      fixture.detectChanges();

      expect(component.date0.getFullYear()).toBe(2010);
    });

    it('should update value when month changed', () => {
      fixture.detectChanges();
      const calendar = fixture.debugElement.queryAll(By.directive(Calendar))[1].injector.get(Calendar);
      calendar.onMonthSelect(10);
      fixture.detectChanges();

      expect(component.date0.getMonth()).toBe(10);
    });

    it('should mark current date in month mode', () => {
      const now = new Date();

      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const cells = host.queryAll(By.css('td'));
      const today = cells.find(x => x.nativeElement.className.indexOf('tri-fullcalendar-today') > 0);

      expect(today).toBeDefined();
      expect(parseInt(today.nativeElement.textContent, 10)).toBe(now.getDate());
    });

    it('should mark active date in month mode', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const cells = host.queryAll(By.css('td'));
      const active = cells.find(x => x.nativeElement.className.indexOf('tri-fullcalendar-selected-day') > 0);

      expect(active).toBeDefined();
      expect(parseInt(active.nativeElement.textContent, 10)).toBe(3);
    });

    it('should mark previous/next month date in month mode', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const cells = host.queryAll(By.css('td'));
      const lastPrevious = cells[3];
      const firstNext = cells[32];

      expect(lastPrevious.nativeElement.className).toContain('tri-fullcalendar-last-month-cell');
      expect(firstNext.nativeElement.className).toContain('tri-fullcalendar-next-month-btn-day');
    });

    it('should mark current month in year mode', () => {
      const now = new Date();
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[3];
      const cells = host.queryAll(By.css('td'));
      const current = cells[now.getMonth()];

      expect(current.nativeElement.className).toContain('tri-fullcalendar-month-panel-current-cell');
    });

    it('should mark active month in year mode', () => {
      component.date2.setDate(1);
      component.date2.setMonth(10);
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[3];
      const cells = host.queryAll(By.css('td'));
      const current = cells[10];

      expect(current.nativeElement.className).toContain('tri-fullcalendar-month-panel-selected-cell');
    });
  });

  describe('fullscreen', () => {
    let fixture: ComponentFixture<TestCalendarFullscreenComponent>;
    let component: TestCalendarFullscreenComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarFullscreenComponent);
      component = fixture.componentInstance;
    }));

    it('should be true by default', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const header = host.query(By.directive(CalendarHeader)).injector.get(CalendarHeader);

      expect(header.fullscreen).toBe(true);
    });

    it('should update fullscreen by fullscreen', () => {
      component.fullscreen = false;

      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const header = host.query(By.directive(CalendarHeader)).injector.get(CalendarHeader);

      expect(header.fullscreen).toBe(false);
    });

    it('should update fullscreen by card', () => {
      component.card = true;

      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[2];
      const header = host.query(By.directive(CalendarHeader)).injector.get(CalendarHeader);

      expect(header.fullscreen).toBe(false);
    });

    it('should support imperative access', () => {
      component.fullscreen = false;

      fixture.detectChanges();

      const calendar = fixture.debugElement.queryAll(By.directive(Calendar))[1].injector.get(Calendar);

      expect(calendar.fullscreen).toBe(false);
      expect(calendar.card).toBe(true);
    });
  });

  describe('date cell', () => {
    let fixture: ComponentFixture<TestCalendarDateCellComponent>;
    let component: TestCalendarDateCellComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarDateCellComponent);
      component = fixture.componentInstance;
    }));

    it('should work when passed via property', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-content'));

      expect(content.nativeElement.textContent).toContain('Foo');
    });

    it('should work when passed via content child', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-content'));

      expect(content.nativeElement.textContent).toContain('Bar');
    });
  });

  describe('date full cell', () => {
    let fixture: ComponentFixture<TestCalendarDateFullCellComponent>;
    let component: TestCalendarDateFullCellComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarDateFullCellComponent);
      component = fixture.componentInstance;
    }));

    it('should work when passed via property', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-date'));

      expect(content.nativeElement.textContent.trim()).toBe('Foo');
    });

    it('should work when passed via content child', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-date'));

      expect(content.nativeElement.textContent.trim()).toBe('Bar');
    });
  });

  describe('month cell', () => {
    let fixture: ComponentFixture<TestCalendarMonthCellComponent>;
    let component: TestCalendarMonthCellComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarMonthCellComponent);
      component = fixture.componentInstance;
    }));

    it('should work when passed via property', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-content'));

      expect(content.nativeElement.textContent).toContain('Foo');
    });

    it('should work when passed via content child', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-content'));

      expect(content.nativeElement.textContent).toContain('Bar');
    });
  });

  describe('month gull cell', () => {
    let fixture: ComponentFixture<TestCalendarMonthFullCellComponent>;
    let component: TestCalendarMonthFullCellComponent;

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestCalendarMonthFullCellComponent);
      component = fixture.componentInstance;
    }));

    it('should work when passed via property', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[0];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-month'));

      expect(content.nativeElement.textContent.trim()).toBe('Foo');
    });

    it('should work when passed via content child', () => {
      fixture.detectChanges();

      const host = fixture.debugElement.queryAll(By.directive(Calendar))[1];
      const content = host.query(By.css('td')).query(By.css('.tri-fullcalendar-month'));

      expect(content.nativeElement.textContent.trim()).toBe('Bar');
    });
  });
});

@Component({
  template: `
    <tri-calendar></tri-calendar>
    <tri-calendar [(mode)]="mode"></tri-calendar>
  `
})
class TestCalendarModeComponent {
  mode: 'month' | 'year' = 'month';
}

@Component({
  template: `
    <tri-calendar></tri-calendar>
    <tri-calendar [(value)]="date0"></tri-calendar>
    <tri-calendar [(ngModel)]="date1"></tri-calendar>
    <tri-calendar [(value)]="date2" [(mode)]="mode"></tri-calendar>
  `
})
class TestCalendarValueComponent {
  date0 = new Date(2001, 1, 3);
  date1 = new Date(2001, 1, 3);
  date2 = new Date();
  mode = 'year';
}

@Component({
  template: `
    <tri-calendar></tri-calendar>
    <tri-calendar [fullscreen]="fullscreen"></tri-calendar>
    <tri-calendar [card]="card"></tri-calendar>
  `
})
class TestCalendarFullscreenComponent {
  fullscreen = true;
  card = false;
}

@Component({
  template: `
    <tri-calendar [dateCell]="tpl"></tri-calendar>
    <ng-template #tpl>Foo</ng-template>
    <tri-calendar>
      <ng-container *triDateCell>Bar</ng-container>
    </tri-calendar>
  `
})
class TestCalendarDateCellComponent {
}

@Component({
  template: `
    <tri-calendar [dateFullCell]="tpl"></tri-calendar>
    <ng-template #tpl>Foo</ng-template>
    <tri-calendar>
      <ng-container *triDateFullCell>Bar</ng-container>
    </tri-calendar>
  `
})
class TestCalendarDateFullCellComponent {
}

@Component({
  template: `
    <tri-calendar mode="year" [monthCell]="tpl"></tri-calendar>
    <ng-template #tpl>Foo</ng-template>
    <tri-calendar mode="year">
      <ng-container *triMonthCell>Bar</ng-container>
    </tri-calendar>
  `
})
class TestCalendarMonthCellComponent {
}

@Component({
  template: `
    <tri-calendar mode="year" [monthFullCell]="tpl"></tri-calendar>
    <ng-template #tpl>Foo</ng-template>
    <tri-calendar mode="year">
      <ng-container *triMonthFullCell>Bar</ng-container>
    </tri-calendar>
  `
})
class TestCalendarMonthFullCellComponent {
}
