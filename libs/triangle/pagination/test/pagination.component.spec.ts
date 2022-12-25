import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaginationComponent, TriPaginationModule } from '@gradii/triangle/pagination';

describe('TriPaginationComponent', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports     : [TriPaginationModule],
        declarations: [TestPaginationBasic, TestPaginationChanger, TestPaginationSimple, TestPaginationShowTotal, TestPaginationQuickJumper],
        providers   : []
      }).compileComponents();
    })
  );
  describe('for tri-pagination', () => {
    it('the correct pages are displayed and the previous page is disabled or not disabled', () => {
      const fixture = TestBed.createComponent(TestPaginationBasic);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(
        debugElement.nativeElement
          .querySelector('.tri-pagination-prev')
          .classList.contains('tri-pagination-item-active')
      ).toBe(false);
      expect(
        debugElement.nativeElement.querySelector('.tri-pagination-prev').classList.contains('tri-pagination-disabled')
      ).toBe(true);
      expect(debugElement.nativeElement.querySelectorAll('.tri-pagination-item').length).toBe(5);

      testComponent._pageIndex = 5;
      testComponent._total = 50;
      fixture.detectChanges();
      expect(
        debugElement.nativeElement
          .querySelector('.tri-pagination-next')
          .classList.contains('tri-pagination-item-active')
      ).toBe(false);
      expect(
        debugElement.nativeElement.querySelector('.tri-pagination-next').classList.contains('tri-pagination-disabled')
      ).toBe(true);

      testComponent._pageIndex = 3;
      testComponent._total = 50;
      fixture.detectChanges();
      expect(
        debugElement.nativeElement
          .querySelector('.tri-pagination-item:nth-child(4)')
          .classList.contains('tri-pagination-item-active')
      ).toBe(true);
      expect(
        debugElement.nativeElement.querySelector('.tri-pagination-prev').classList.contains('tri-pagination-disabled')
      ).toBe(false);
      expect(
        debugElement.nativeElement.querySelector('.tri-pagination-next').classList.contains('tri-pagination-disabled')
      ).toBe(false);

      testComponent._pageIndex = 3;
      testComponent._total = 500;
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelectorAll('.tri-pagination-item').length).toBe(6);
      expect(debugElement.nativeElement.querySelector('.tri-pagination-jump-next')).toBeDefined();
    });

    it('correct double binding', () => {
      const fixture = TestBed.createComponent(TestPaginationBasic);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      testComponent._total = 50;
      fixture.detectChanges();
      debugElement.nativeElement.querySelector('.tri-pagination-item:nth-child(4)').click();
      fixture.detectChanges();
      expect(testComponent._pageIndex).toBe(3);
    });

    it('change each page to display the entry', () => {
      const fixture = TestBed.createComponent(TestPaginationChanger);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination-options')).toBeDefined();
      expect(debugElement.nativeElement.querySelectorAll('.tri-pagination-item').length).toBe(6);

      testComponent._pageSize = 20;
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelectorAll('.tri-pagination-item').length).toBe(6);
    });

    it('mini version shows normal', () => {
      const fixture = TestBed.createComponent(TestPaginationChanger);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      testComponent._size = '';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination').classList.contains('mini')).toBe(false);

      testComponent._size = 'small';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination').classList.contains('mini')).toBe(true);
    });

    it('Quickly jump to a page', () => {
      const fixture = TestBed.createComponent(TestPaginationQuickJumper);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination-options-quick-jumper')).toBeDefined();

      testComponent._size = 'small';
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination').classList.contains('mini')).toBe(true);
    });

    it('simply flip the page', () => {
      const fixture = TestBed.createComponent(TestPaginationSimple);
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(
        debugElement.nativeElement.querySelector('.tri-pagination').classList.contains('tri-pagination-simple')
      ).toBe(true);
    });

    it('show how much data is available by setting showTotal.', () => {
      const fixture = TestBed.createComponent(TestPaginationShowTotal);
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination-total-text')).toBeDefined();
    });
    it('correct disabled style when reach first and last pageIndex', () => {
      const fixture = TestBed.createComponent(TestPaginationShowTotal);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement = fixture.debugElement.query(By.directive(PaginationComponent));
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination-prev').className).toEqual(
        'tri-pagination-prev tri-pagination-disabled'
      );
      testComponent.pageIndex = 4;
      fixture.detectChanges();
      expect(debugElement.nativeElement.querySelector('.tri-pagination-next').className).toEqual(
        'tri-pagination-next tri-pagination-disabled'
      );
    });
  });

  @Component({
    selector: 'tri-test-pagination-basic',
    template: `
      <tri-pagination [pageIndex]="_pageIndex"
                      [total]="_total"
                      (pageChange)="_pageIndex = $event.pageIndex"></tri-pagination>
    `
  })
  class TestPaginationBasic {
    _pageIndex = 1;
    _total = 50;
    // _size = '';
  }

  @Component({
    selector: 'tri-test-pagination-changer',
    template: `
      <tri-pagination [pageIndex]="_pageIndex"
                      [pageSize]="_pageSize"
                      [total]="_total"
                      [showSizeChanger]="true"
                      [size]="_size"></tri-pagination>`
  })
  class TestPaginationChanger {
    _pageIndex = 3;
    _total = 500;
    _pageSize = 40;
    _size = '';
  }

  @Component({
    selector: 'tri-demo-pagination-quick-jumper',
    template: `
      <tri-pagination [pageIndex]="1"
                      [total]="50"
                      [size]="_size"
                      [showSizeChanger]="true"
                      [showQuickJumper]="true"></tri-pagination>
    `
  })
  class TestPaginationQuickJumper {
    _size = '';
  }

  @Component({
    selector: 'tri-test-pagination-simple',
    template: `
      <tri-pagination [pageIndex]="2" [total]="50" [simple]="true"></tri-pagination>`,
    styles  : []
  })
  class TestPaginationSimple {
  }

  @Component({
    selector: 'tri-test-pagination-total',
    template: `
      <tri-pagination [pageIndex]="pageIndex" [total]="80" [showTotal]="true" [pageSize]="20"></tri-pagination>`,
    styles  : []
  })
  class TestPaginationShowTotal {
    pageIndex = 1;
  }
});
