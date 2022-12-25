import {
  Component,
  DebugElement,
  TemplateRef,
  ViewChild
} from '@angular/core';
import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ListComponent,
  TriListModule
} from '@gradii/triangle/list';

describe('list', () => {
  let fixture: ComponentFixture<TestListComponent>;
  let context: TestListComponent;
  let dl: DebugElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports     : [TriListModule],
      declarations: [TestListComponent, TestListWithTemplateComponent, TestListItemComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestListComponent);
    context = fixture.componentInstance;
    dl      = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('[fields]', () => {
    describe('#itemLayout', () => {
      for (const item of [{type: 'default', ret: false}, {type: 'vertical', ret: true}]) {
        it(`[${item.type}]`, () => {
          context.itemLayout = item.type;
          fixture.detectChanges();
          expect(dl.query(By.css(`.tri-list-${item.type}`)) != null).toBe(item.ret);
        });
      }
    });

    describe('#bordered', () => {
      for (const value of [true, false]) {
        it(`[${value}]`, () => {
          context.bordered = value;
          fixture.detectChanges();
          expect(dl.query(By.css('.tri-list-bordered')) != null).toBe(value);
        });
      }
    });

    describe('#header', () => {
      it('with string', () => {
        expect(dl.query(By.css('.tri-list-header')) != null).toBe(true);
      });
      it('with custom template', () => {
        const fixtureTemp = TestBed.createComponent(TestListWithTemplateComponent);
        fixtureTemp.detectChanges();
        expect(fixtureTemp.debugElement.query(By.css('.list-header')) != null).toBe(true);
      });
    });

    describe('#footer', () => {
      it('with string', () => {
        expect(dl.query(By.css('.tri-list-footer')) != null).toBe(true);
      });
      it('with custom template', () => {
        const fixtureTemp = TestBed.createComponent(TestListWithTemplateComponent);
        fixtureTemp.detectChanges();
        const footerEl = fixtureTemp.debugElement.query(By.css('.tri-list-footer'));
        expect((footerEl.nativeElement as HTMLDivElement).innerText).toBe(
          fixtureTemp.componentInstance
            .footer as string);
      });
      it('change string to template', () => {
        const fixtureTemp = TestBed.createComponent(TestListWithTemplateComponent);
        fixtureTemp.detectChanges();
        const footerEl = fixtureTemp.debugElement.query(By.css('.tri-list-footer'));
        expect((footerEl.nativeElement as HTMLDivElement).innerText).toBe(
          fixtureTemp.componentInstance
            .footer as string);
        (fixtureTemp.debugElement.query(
          By.css('#change')).nativeElement as HTMLButtonElement).click();
        fixtureTemp.detectChanges();
        expect(fixtureTemp.debugElement.query(By.css('.list-footer')) != null).toBe(true);
      });
    });

    describe('#size', () => {
      for (const item of [
        {type: 'default', cls: '.tri-list'},
        {type: 'small', cls: '.tri-list-sm'},
        {type: 'large', cls: '.tri-list-lg'}
      ]) {
        it(`[${item.type}]`, () => {
          context.size = item.type;
          fixture.detectChanges();
          expect(dl.query(By.css(item.cls)) != null).toBe(true);
        });
      }
    });

    describe('#split', () => {
      for (const value of [true, false]) {
        it(`[${value}]`, () => {
          context.split = value;
          fixture.detectChanges();
          expect(dl.query(By.css('.tri-list-split')) != null).toBe(value);
        });
      }
    });

    describe('#loading', () => {
      for (const value of [true, false]) {
        it(`[${value}]`, () => {
          context.loading = value;
          fixture.detectChanges();
          expect(dl.query(By.css('.tri-list-loading')) != null).toBe(value);
        });
      }

      it('should be minimum area block when data is empty', () => {
        context.loading = true;
        context.data    = [];
        fixture.detectChanges();
        expect(dl.query(By.css('.tri-spin-nested-loading'))).not.toBeNull();
      });
    });

    describe('#dataSource', () => {
      it('should working', () => {
        expect(dl.queryAll(By.css('tri-list-item')).length).toBe(context.data!.length);
      });

      it('should be render empty text when data source is empty', () => {
        expect(dl.queryAll(By.css('.tri-list-empty-text')).length).toBe(0);
        context.data = [];
        fixture.detectChanges();
        expect(dl.queryAll(By.css('.tri-list-empty-text')).length).toBe(1);
      });

      it('should be ingore empty text when unspecified data source', () => {
        context.data = undefined;
        fixture.detectChanges();
        expect(dl.queryAll(By.css('.tri-list-empty-text')).length).toBe(0);
      });
    });

    it('#grid', () => {
      const colCls = `.tri-col-${context.grid.span}`;
      expect(dl.queryAll(By.css(colCls)).length).toBe(context.data!.length);
    });

    it('#loadMore', () => {
      expect(dl.query(By.css('.loadmore')) != null).toBe(true);
    });

    it('#pagination', () => {
      expect(dl.query(By.css('.pagination')) != null).toBe(true);
    });
  });

  describe('item', () => {
    let fixtureTemp: ComponentFixture<TestListItemComponent>;
    beforeEach(() => {
      fixtureTemp = TestBed.createComponent(TestListItemComponent);
      fixtureTemp.detectChanges();
    });
    it('with string', () => {
      expect(
        fixtureTemp.debugElement.query(By.css('#item-string .tri-list-item-content')) != null).toBe(
        true);
      expect(
        fixtureTemp.debugElement.query(By.css('#item-string .tri-list-item-action')) != null).toBe(
        true);
      expect(
        fixtureTemp.debugElement.query(By.css('#item-string .tri-list-item-extra')) != null).toBe(
        true);
    });
    it('with custom template of [content]', () => {
      expect(
        fixtureTemp.debugElement.query(
          By.css('#item-template .tri-list-item-content .item-content')) != null
      ).toBe(true);
    });
  });

  describe('item-meta', () => {
    let fixtureTemp: ComponentFixture<TestListItemComponent>;
    beforeEach(() => {
      fixtureTemp = TestBed.createComponent(TestListItemComponent);
      fixtureTemp.detectChanges();
    });
    it('with string', () => {
      expect(fixtureTemp.debugElement.query(
        By.css('#item-string .tri-list-item-meta-title')) != null).toBe(true);
      expect(fixtureTemp.debugElement.query(
        By.css('#item-string .tri-list-item-meta-description')) != null).toBe(true);
      expect(fixtureTemp.debugElement.query(
        By.css('#item-string .tri-list-item-meta-avatar')) != null).toBe(true);
    });
    it('with custom template', () => {
      expect(fixtureTemp.debugElement.query(By.css('#item-template .item-title')) != null).toBe(
        true);
      expect(fixtureTemp.debugElement.query(By.css('#item-template .item-desc')) != null).toBe(
        true);
      expect(fixtureTemp.debugElement.query(By.css('#item-template .item-avatar')) != null).toBe(
        true);
    });
  });
});

@Component({
  template: `
    <tri-list
      #comp
      [dataSource]="data"
      [itemLayout]="itemLayout"
      [bordered]="bordered"
      [footer]="footer"
      [header]="header"
      [loading]="loading"
      [size]="size"
      [split]="split"
      [grid]="grid"
      [renderItem]="item"
      [loadMore]="loadMore"
      [pagination]="pagination"
    >
      <ng-template #item let-item>
        <tri-list-item>
          <tri-list-item-meta
            title="title"
            avatar="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            description="Ant Design, a design language for background applications, is refined by Ant UED Team"
          >
          </tri-list-item-meta>
        </tri-list-item>
      </ng-template>
      <ng-template #loadMore>
        <div class="loadmore">loadmore</div>
      </ng-template>
      <ng-template #pagination>
        <div class="pagination">pagination</div>
      </ng-template>
    </tri-list>
  `
})
class TestListComponent {
  @ViewChild('comp', {static: false}) comp: ListComponent;
  itemLayout      = 'horizontal';
  bordered        = false;
  footer          = 'footer';
  header          = 'header';
  loading         = false;
  size            = 'default';
  split           = true;
  data?: string[] = [
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.',
    'Racing car sprays burning fuel into crowd.',
    'Japanese princess to wed commoner.'
  ];
  // tslint:disable-next-line:no-any
  grid: any       = {gutter: 16, span: 12};
}

@Component({
  template: `
    <button (click)="footer = footerTpl" id="change">change</button>
    <tri-list [footer]="footer" [header]="h">
      <ng-template #f><p class="list-footer">footer</p></ng-template>
      <ng-template #h><p class="list-header">header</p></ng-template>
    </tri-list>
  `
})
class TestListWithTemplateComponent {
  @ViewChild('f', {static: false}) footerTpl: TemplateRef<void>;

  footer: string | TemplateRef<void> = 'footer with string';
}

@Component({
  template: `
    <tri-list id="item-string">
      <tri-list-item [content]="'content'" [actions]="[action]" [extra]="extra">
        <ng-template #action><i tri-icon type="star-o" style="margin-right: 8px;"></i> 156</ng-template>
        <ng-template #extra>
          <img width="272" alt="logo" src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"/>
        </ng-template>
        <tri-list-item-meta
          title="title"
          avatar="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          description="Ant Design, a design language for background applications, is refined by Ant UED Team"
        >
        </tri-list-item-meta>
      </tri-list-item>
    </tri-list>
    <tri-list id="item-template">
      <tri-list-item [content]="content">
        <ng-template #content><p class="item-content">content</p></ng-template>
        <tri-list-item-meta [title]="title" [avatar]="avatar" [description]="description">
          <ng-template #title><p class="item-title">title</p></ng-template>
          <ng-template #avatar><p class="item-avatar">avatar</p></ng-template>
          <ng-template #description><p class="item-desc">description</p></ng-template>
        </tri-list-item-meta>
      </tri-list-item>
    </tri-list>
  `
})
class TestListItemComponent {
}
