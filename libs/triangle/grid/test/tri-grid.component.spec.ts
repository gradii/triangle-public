import { Component, DebugElement } from '@angular/core';
/* tslint:disable:no-unused-variable */
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ColDirective, RowDirective, TriGridModule } from '@gradii/triangle/grid';

describe('grid, column layout and responsive tiers', () => {
  beforeEach(
    async(() => {
      TestBed.configureTestingModule({
        imports     : [TriGridModule],
        declarations: [
          GridListWithoutCols,
          GridListWithoutRows,
          TestSpan,
          TestOffset,
          TestPushPull,
          TestColResponsive,
          TestGutter,
          TestTypeFlex,
          TestTypeFlexOrder,
          TestTypeEmbedded
        ]
      }).compileComponents();
    })
  );
  describe('for cols', () => {
    it('should throw error if cols is not defined', () => {
      const fixture = TestBed.createComponent(GridListWithoutCols);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should apply class based on span attribute', () => {
      const fixture = TestBed.createComponent(TestSpan);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));
      const debugElement_row = fixture.debugElement.query(By.directive(RowDirective));

      testComponent._span = 8;
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-8')).toBe(true);

      testComponent._span = 13;
      fixture.detectChanges();
      const col_width = parseFloat(getStyle(debugElement_col, 'width'));
      const row_width = parseFloat(getStyle(debugElement_row, 'width'));
      expect(col_width).toBeGreaterThan(row_width / 2); // Change the line
      expect(debugElement_col.nativeElement.classList.contains('tri-col-13')).toBe(true);

      testComponent._span = 30;
      fixture.detectChanges();
      const col_width1 = parseFloat(getStyle(debugElement_col, 'width'));
      const row_width1 = parseFloat(getStyle(debugElement_row, 'width'));
      expect(col_width1).toEqual(row_width1); // toEqual
      expect(debugElement_col.nativeElement.classList.contains('tri-col-30')).toBe(true);

      testComponent._span = 0;
      fixture.detectChanges();
      const col_width2 = parseFloat(getStyle(debugElement_col, 'width'));
      const row_width2 = parseFloat(getStyle(debugElement_row, 'width'));
      expect(col_width2).toEqual(row_width2); // toEqual
      expect(debugElement_col.nativeElement.classList.contains('tri-col-0')).toBe(false);

      testComponent._span = 1 / 3;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._span = -31;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._span = 'custom_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on offset attribute', () => {
      const fixture = TestBed.createComponent(TestOffset);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      testComponent._offset1 = 16;
      testComponent._span1 = 8;
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-offset-16')).toBe(true);

      testComponent._offset = 0;
      testComponent._span1 = 8;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-offset-0')).toBe(false);

      testComponent._offset1 = 24;
      testComponent._span1 = 8;
      fixture.detectChanges();

      testComponent._offset = 100;
      testComponent._span1 = 8;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._offset1 = 8;
      testComponent._span1 = 100;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._offset = 4 / 7;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._offset = -100;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._offset = 'custorm_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on push|pull attribute', () => {
      const fixture = TestBed.createComponent(TestPushPull);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      testComponent._span1 = 6;
      testComponent._push = 18;
      testComponent._span2 = 18;
      testComponent._pull = 6;
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-push-18')).toBe(true);
      expect(debugElement_col.nativeElement.classList.contains('tri-col-pull-6')).toBe(true);

      testComponent._span1 = 6;
      testComponent._push = 'custorm_string';
      testComponent._span2 = 18;
      testComponent._pull = 'custorm_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on responsive attribute', () => {
      const fixture = TestBed.createComponent(TestColResponsive);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      // window.resizeTo(800, 600);
      testComponent._col1 = {xs: 2, xm: 4, md: 6, lg: 8, xl: 10};
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-xs-2')).toBe(true);
      expect(debugElement_col.nativeElement.classList.contains('tri-col-sm-4')).toBe(true);
      expect(debugElement_col.nativeElement.classList.contains('tri-col-md-6')).toBe(true);
      expect(debugElement_col.nativeElement.classList.contains('tri-col-lg-8')).toBe(true);
      expect(debugElement_col.nativeElement.classList.contains('tri-col-xl-10')).toBe(true);

      testComponent._col1 = {xs: 'custom_string', xm: 4, md: 6, lg: 8, xl: 10};
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should should not clear previous defined classes', () => {
      const fixtureSpan = TestBed.createComponent(TestSpan);
      const testComponentSpan = fixtureSpan.debugElement.componentInstance;
      const debugElement_col_span = fixtureSpan.debugElement.query(By.directive(ColDirective));
      debugElement_col_span.nativeElement.classList.add('custom-class');
      testComponentSpan._span = 6;
      fixtureSpan.detectChanges();
      expect(debugElement_col_span.nativeElement.classList.contains('custom-class')).toBe(true);

      const fixtureOffset = TestBed.createComponent(TestOffset);
      const testComponentOffset = fixtureOffset.debugElement.componentInstance;
      const debugElement_col_offset = fixtureOffset.debugElement.query(By.directive(ColDirective));
      debugElement_col_offset.nativeElement.classList.add('custom-class');
      testComponentOffset._span1 = 6;
      testComponentOffset._offset1 = 7;
      fixtureOffset.detectChanges();
      expect(debugElement_col_offset.nativeElement.classList.contains('custom-class')).toBe(true);

      const fixturePushPull = TestBed.createComponent(TestPushPull);
      const testComponentPush = fixturePushPull.debugElement.componentInstance;
      const debugElement_col_push = fixturePushPull.debugElement.query(By.directive(ColDirective));
      debugElement_col_push.nativeElement.classList.add('custom-class');
      testComponentPush._span1 = 6;
      testComponentPush._push = 3;
      testComponentPush._pull = 4;
      fixturePushPull.detectChanges();
      expect(debugElement_col_push.nativeElement.classList.contains('custom-class')).toBe(true);

      const fixtureResponsive = TestBed.createComponent(TestColResponsive);
      const testComponentResponsive = fixtureResponsive.debugElement.componentInstance;
      const debugElement_col_responsive = fixtureResponsive.debugElement.query(By.directive(ColDirective));
      debugElement_col_responsive.nativeElement.classList.add('custom-class');
      testComponentResponsive._col1 = {xs: 2, xm: 4, md: 6, lg: 8, xl: 10};
      fixtureResponsive.detectChanges();
      expect(debugElement_col_responsive.nativeElement.classList.contains('custom-class')).toBe(true);
    });
    it('should embedded style work', () => {
      const fixtureSpan = TestBed.createComponent(TestTypeEmbedded);
      const debugElement_embedded_span = fixtureSpan.debugElement.query(By.directive(ColDirective));
      fixtureSpan.detectChanges();
      const className =
              'tri-col-xs-1 tri-col-xs-pull-1 tri-col-xs-push-1 tri-col-xs-offset-1 tri-col-xs-order-1 tri-col-sm-1 tri-col-sm-pull-1 tri-col-sm-push-1 tri-col-sm-offset-1 tri-col-sm-order-1 tri-col-md-1 tri-col-md-pull-1 tri-col-md-push-1 tri-col-md-offset-1 tri-col-md-order-1 tri-col-lg-1 tri-col-lg-pull-1 tri-col-lg-push-1 tri-col-lg-offset-1 tri-col-lg-order-1 tri-col-xl-1 tri-col-xl-pull-1 tri-col-xl-push-1 tri-col-xl-offset-1 tri-col-xl-order-1';
      expect(debugElement_embedded_span.nativeElement.className === className).toBe(true);
    });
  });

  describe('for rows', () => {
    it('should throw error if rows is not defined', () => {
      const fixture = TestBed.createComponent(GridListWithoutRows);
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on gutter attribute', () => {
      const fixture = TestBed.createComponent(TestGutter);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_row = fixture.debugElement.query(By.directive(RowDirective));
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      testComponent._gutter = 16;
      fixture.detectChanges();
      const rowML = getStyle(debugElement_row, 'margin-left');
      const rowMR = getStyle(debugElement_row, 'margin-right');
      expect(rowML).toEqual('-8px');
      expect(rowMR).toEqual('-8px');
      const colML = getStyle(debugElement_col, 'padding-left');
      const colMR = getStyle(debugElement_col, 'padding-right');
      expect(colML).toEqual('8px');
      expect(colMR).toEqual('8px');

      testComponent._gutter = 0;
      fixture.detectChanges();
      const rowML1 = getStyle(debugElement_row, 'margin-left');
      const rowMR1 = getStyle(debugElement_row, 'margin-right');
      expect(rowML1).toEqual('0px');
      expect(rowMR1).toEqual('0px');
      const colML1 = getStyle(debugElement_col, 'padding-left');
      const colMR1 = getStyle(debugElement_col, 'padding-right');
      expect(colML1).toEqual('0px');
      expect(colMR1).toEqual('0px');

      testComponent._gutter = -16;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._gutter = 'custorm_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should apply class based on type|justify|align attribute', () => {
      const fixture = TestBed.createComponent(TestTypeFlex);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_row = fixture.debugElement.query(By.directive(RowDirective));
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      testComponent._type = 'flex';
      fixture.detectChanges();
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex')).toBe(true);
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-top')).toBe(true);
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-start')).toBe(true);

      testComponent._justify = 'center';
      fixture.detectChanges();
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-center')).toBe(true);

      testComponent._align = 'middle';
      fixture.detectChanges();
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-middle')).toBe(true);

      testComponent._justify = 'custorm_string';
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();

      testComponent._type = '';
      testComponent._align = 'top';
      fixture.detectChanges();
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex')).toBe(false);
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-top')).toBe(false);

      testComponent._type = '';
      testComponent._justify = 'start';
      fixture.detectChanges();
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex')).toBe(false);
      expect(debugElement_row.nativeElement.classList.contains('tri-row-flex-start')).toBe(false);
    });

    it('should apply class based on order attribute', () => {
      const fixture = TestBed.createComponent(TestTypeFlexOrder);
      const testComponent = fixture.debugElement.componentInstance;
      const debugElement_row = fixture.debugElement.query(By.directive(RowDirective));
      const debugElement_col = fixture.debugElement.query(By.directive(ColDirective));

      testComponent._type = 'flex';
      testComponent._order1 = '2';
      testComponent._order2 = '1';
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-order-2')).toBe(true);

      testComponent._order1 = '5';
      testComponent._order2 = '10';
      fixture.detectChanges();
      expect(debugElement_col.nativeElement.classList.contains('tri-col-order-5')).toBe(true);

      testComponent._order1 = -2;
      testComponent._order2 = -1;
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });
  });
});

function getStyle(el: DebugElement, prop: string): string {
  return getComputedStyle(el.nativeElement).getPropertyValue(prop);
}

/** Test component that contains an grid. */
@Component({template: '<div tri-row></div>'})
class GridListWithoutCols {
}

@Component({template: '<div tri-col></div>'})
class GridListWithoutRows {
}

@Component({
  selector: 'test-span',
  template: `
    <div tri-row [type]="'legacy'">
      <div tri-col style="background-color: #0e639c" [span]="_span">
        col-{{_span}}
      </div>
      <div tri-col style="background-color: #00a0e9" [span]="_span">
        col-{{_span}}
      </div>
    </div>
  `
})
class TestSpan {
  _span = 5;
}

@Component({
  selector: 'test-offset',
  template: `
    <div tri-row>
      <div tri-col [span]="_span1" [offset]="_offset1" style="background-color: #0e639c">
        col-{{_span1}}-{{_offset1}}
      </div>
      <div tri-col [span]="_span2" [offset]="_offset2" style="background-color: #00a0e9">
        col-{{_span2}}-{{_offset2}}
      </div>
    </div>
  `
})
class TestOffset {
  _span1 = 12;
  _offset1 = 8;
  _span2 = 12;
  _offset2 = 8;
}

@Component({
  selector: 'test-push-pull',
  template: `
    <div tri-row>
      <div tri-col [span]="_span1" [push]="_push" [pull]="_pull" style="background-color: #0e639c">
        col-{{_span1}} col-push-{{_push}}-{{_pull}}
      </div>
    </div>
  `
})
class TestPushPull {
  _span1 = 18;
  _push = 6;
  _pull = 18;
}

@Component({
  selector: 'test-col-responsive',
  template: `
    <div tri-row>
      <div tri-col [xs]="_col1.xs" [sm]="_col1.xm" [md]="_col1.md" [lg]="_col1.lg" [xl]="_col1.xl">
        Col
      </div>
    </div>`
})
class TestColResponsive {
  _col1 = {xs: 2, xm: 4, md: 6, lg: 8, xl: 10};
}

@Component({
  selector: 'test-gutter',
  template: `
    <div style="margin:20px;">
      <div tri-row [gutter]="_gutter">
        <div tri-col [span]="_span">
          <div style="background-color: #0e639c">col-{{_span}}</div>
        </div>
        <div tri-col [span]="_span">
          <div style="background-color: #00a0e9">col-{{_span}}</div>
        </div>
      </div>
    </div>
  `
})
class TestGutter {
  _span = 6;
  _gutter = 16;
}

@Component({
  selector: 'test-type-flex',
  template: `
    <div tri-row [type]="_type" [justify]="_justify" [align]="_align">
      <div tri-col [span]="4" style="background-color: #00a0e9">
        col-4
      </div>
      <div tri-col [span]="4" style="background-color: #00a2ae">
        col-4
      </div>
      <div tri-col [span]="4" style="background-color: #00a854">
        col-4
      </div>
    </div>
  `
})
class TestTypeFlex {
  _type = 'flex';
  _justify = 'start';
  _align = 'top';
}

@Component({
  selector: 'test-type-flex',
  template: `
    <div tri-row [type]="_type">
      <div tri-col [span]="6" [order]="_order1" style="background-color: #00a854">
        NO1 : col-order-{{_order1}}
      </div>
      <div tri-col [span]="6" [order]="_order2" style="background-color: #00a0e9">
        NO2 : col-order-{{_order2}}
      </div>
    </div>
  `
})
class TestTypeFlexOrder {
  _type = 'flex';
  _order1 = 1;
  _order2 = 2;
}

@Component({
  selector: 'test-type-embedded',
  template: `
    <div tri-row [type]="'flex'">
      <div
        tri-col
        [xs]="{ span: 1, offset: 1,push:1, order:1,pull:1 }"
        [sm]="{ span: 1, offset: 1,push:1, order:1,pull:1 }"
        [md]="{ span: 1, offset: 1,push:1, order:1,pull:1 }"
        [lg]="{ span: 1, offset: 1,push:1, order:1,pull:1 }"
        [xl]="{ span: 1, offset: 1,push:1, order:1,pull:1 }"></div>
    </div>
  `
})
class TestTypeEmbedded {
}
