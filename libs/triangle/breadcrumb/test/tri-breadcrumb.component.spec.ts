/* tslint:disable:no-unused-variable */
import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BreadcrumbComponent,
  BreadcrumbItemComponent,
  TriBreadcrumbModule
} from '@gradii/triangle/breadcrumb';

describe('breadcrumb', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports     : [TriBreadcrumbModule],
        declarations: [WithoutBreadcrumb, WithoutBreadcrumbItem, TestBreadcrumb, TestSeparator],
        providers   : []
      }).compileComponents();
    })
  );
  describe('for Breadcrumb', () => {
    // it('should throw error if Breadcrumb is not defined', () => {
    //   const fixture = TestBed.createComponent(WithoutBreadcrumb);
    //   expect(() => fixture.detectChanges()).not.toThrow();
    // });

    it('should apply class if Breadcrumb is defined', () => {
      const fixture = TestBed.createComponent(TestBreadcrumb);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(BreadcrumbComponent));

      testComponent._custormString = 'Home';
      fixture.detectChanges();
      expect(debugElement.nativeElement.classList.contains('tri-breadcrumb')).toBe(true);

      testComponent._custormString = '';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._custormString = null;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
    it('should should not clear previous defined classes', () => {
      const fixture = TestBed.createComponent(TestBreadcrumb);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(BreadcrumbComponent));

      debugElement.nativeElement.classList.add('custom-class');

      testComponent._custormString = 'Home';
      fixture.detectChanges();
      expect(debugElement.nativeElement.classList.contains('tri-breadcrumb')).toBe(true);
      expect(debugElement.nativeElement.classList.contains('custom-class')).toBe(true);

      testComponent._custormString = '';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._custormString = null;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on separator attribute ', () => {
      const fixture = TestBed.createComponent(TestSeparator);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(BreadcrumbComponent));

      testComponent._separator = '>';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-breadcrumb-separator')).toBeDefined();
      expect(debugElement.nativeElement.querySelector('.tri-breadcrumb-separator').innerHTML).toEqual('&gt;');

      testComponent._separator = '';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-breadcrumb-separator')).toBeDefined();

      testComponent._separator = '<a href="">custorm_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
  describe('for BreadcrumbItem', () => {
    // it('should throw error if BreadcrumbItem is not defined', () => {
    //   const fixture = TestBed.createComponent(WithoutBreadcrumbItem);
    //   expect(() => fixture.detectChanges()).not.toThrow();
    // });
    it('should Custom text content', () => {
      const fixture = TestBed.createComponent(TestBreadcrumb);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(BreadcrumbItemComponent));

      testComponent._custormString = 'Home2';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-breadcrumb-link')).toBeDefined();
      expect(debugElement.nativeElement.querySelector('.tri-breadcrumb-separator')).toBeDefined();

      testComponent._custormString = '<a href="">custom text content';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

@Component({
  selector: 'test-without-breadcrumb-item',
  template: `
    <tri-breadcrumb></tri-breadcrumb>
  `
})
class WithoutBreadcrumbItem {
}

@Component({
  selector: 'test-without-breadcrumb',
  template: `
    <tri-breadcrumb-item>
      Home
    </tri-breadcrumb-item>
  `
})
class WithoutBreadcrumb {
}

@Component({
  selector: 'test-breadcrumb',
  template: `
    <tri-breadcrumb>
      <tri-breadcrumb-item>
        {{_custormString}}
      </tri-breadcrumb-item>
      <tri-breadcrumb-item>
        {{_custormString}}
      </tri-breadcrumb-item>
    </tri-breadcrumb>
  `
})
class TestBreadcrumb {
  _custormString = 'Home';
}

@Component({
  selector: 'test-separator',
  template: `
    <tri-breadcrumb [separator]="_separator">
      <tri-breadcrumb-item>
        Home
      </tri-breadcrumb-item>
      <tri-breadcrumb-item>
        Home2
      </tri-breadcrumb-item>
    </tri-breadcrumb>
  `
})
class TestSeparator {
  _separator = '>';
}
