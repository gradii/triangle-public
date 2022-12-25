import { Component, DebugElement, ViewChild } from '@angular/core';
// tslint:disable
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ScrollService } from '@gradii/triangle/core';
import { AnchorComponent } from '../src/anchor.component';
import { TriAnchorModule } from '../src/anchor.module';

const throttleTime = 51;
describe('anchor', () => {
  let fixture: ComponentFixture<TestComponent>;
  let dl: DebugElement;
  let context: TestComponent;
  let page: PageObject;
  let srv: ScrollService;
  beforeEach(() => {
    const i = TestBed.configureTestingModule({
      imports     : [TriAnchorModule],
      declarations: [TestComponent]
    });
    fixture = TestBed.createComponent(TestComponent);
    dl = fixture.debugElement;
    context = fixture.componentInstance;
    fixture.detectChanges();
    page = new PageObject();
    spyOn(context, '_scroll');
    srv = i.get(ScrollService);
  });
  afterEach(() => context.comp.ngOnDestroy());

  describe('[default]', () => {
    it(`should scolling to target via click a link`, () => {
      spyOn(srv, 'scrollTo').and.callFake((
        containerEl: Element | Window,
        targetTopValue: number = 0,
        easing?: any,
        callback?: () => void
      ) => {
        callback();
      });
      expect(context._scroll).not.toHaveBeenCalled();
      page.to('#何时使用');
      expect(context._scroll).toHaveBeenCalled();
    });

    it('should hava remove listen when the component is destroyed', () => {
      expect((context.comp as any).scroll$.closed).toBeFalsy();
      context.comp.ngOnDestroy();
      fixture.detectChanges();
      expect((context.comp as any).scroll$.closed).toBeTruthy();
    });

    it('should actived when scrolling to the anchor', (done: () => void) => {
      expect(context._scroll).not.toHaveBeenCalled();
      page.scrollTo();
      setTimeout(() => {
        const inkNode = page.getEl('.tri-anchor-ink-ball');
        expect(+inkNode.style.top.replace('px', '')).toBeGreaterThan(0);
        expect(context._scroll).toHaveBeenCalled();
        done();
      }, throttleTime);
    });

    it(`won't scolling when is not exists link`, () => {
      spyOn(srv, 'getScroll');
      expect(context._scroll).not.toHaveBeenCalled();
      expect(srv.getScroll).not.toHaveBeenCalled();
      page.to('#invalid');
      expect(srv.getScroll).not.toHaveBeenCalled();
    });

    it(`won't scolling when is invalid link`, () => {
      spyOn(srv, 'getScroll');
      expect(context._scroll).not.toHaveBeenCalled();
      expect(srv.getScroll).not.toHaveBeenCalled();
      page.to('invalidLink');
      expect(srv.getScroll).not.toHaveBeenCalled();
    });

    it(`supports complete href link (e.g. http://www.example.com/#id)`, () => {
      spyOn(srv, 'getScroll');
      expect(context._scroll).not.toHaveBeenCalled();
      expect(srv.getScroll).not.toHaveBeenCalled();
      page.getEl('.mock-complete').click();
      fixture.detectChanges();
      expect(srv.getScroll).not.toHaveBeenCalled();
    });

    it(`should priorities most recently`, (done: () => void) => {
      expect(context._scroll).not.toHaveBeenCalled();
      page.scrollTo('#parallel1');
      setTimeout(() => {
        expect(context._scroll).toHaveBeenCalled();
        done();
      }, throttleTime);
    });
  });

  describe('property', () => {
    describe('[affix]', () => {
      it(`is [true]`, () => {
        const linkList = dl.queryAll(By.css('tri-affix'));
        expect(linkList.length).toBe(1);
      });
      it(`is [false]`, () => {
        let linkList = dl.queryAll(By.css('tri-affix'));
        expect(linkList.length).toBe(1);
        context.affix = false;
        fixture.detectChanges();
        linkList = dl.queryAll(By.css('tri-affix'));
        expect(linkList.length).toBe(0);
      });
    });

    describe('[offsetTop]', () => {
      it('should be using "calc" method calculate max-height', () => {
        const wrapperEl = dl.query(By.css('.tri-anchor-wrapper'));
        expect(wrapperEl.styles['max-height']).toContain('calc(');
      });
    });

    describe('[showInkInFixed]', () => {
      beforeEach(() => {
        context.affix = false;
        fixture.detectChanges();
      });
      it('should be show ink when [false]', () => {
        context.showInkInFixed = false;
        fixture.detectChanges();
        scrollTo();
        expect(dl.query(By.css('.fixed')) == null).toBe(false);
      });
      it('should be hide ink when [true]', () => {
        context.showInkInFixed = true;
        fixture.detectChanges();
        scrollTo();
        expect(dl.query(By.css('.fixed')) == null).toBe(true);
      });
    });

    it('(click)', () => {
      spyOn(context, '_click');
      expect(context._click).not.toHaveBeenCalled();
      const linkList = dl.queryAll(By.css('.tri-anchor-link-title'));
      expect(linkList.length).toBeGreaterThan(0);
      (linkList[0].nativeElement as HTMLLinkElement).click();
      fixture.detectChanges();
      expect(context._click).toHaveBeenCalled();
    });
  });

  describe('link', () => {
    it(`should show custom template of [template]`, () => {
      expect(dl.query(By.css('.template-title')) != null).toBe(true);
    });
    /*
    it(`should show custom template of [title]`, () => {
      expect(dl.query(By.css('.title-title')) != null).toBe(true);
    });
    */
  });

  describe('**boundary**', () => {
    it('#getOffsetTop', (done: () => void) => {
      const el1 = document.getElementById('何时使用');
      // @ts-ignore
      spyOn(el1, 'getClientRects').and.returnValue([]);
      const el2 = document.getElementById('parallel1');
      spyOn(el2, 'getBoundingClientRect').and.returnValue(new DOMRect(0, 0));
      expect(context._scroll).not.toHaveBeenCalled();
      page.scrollTo();
      setTimeout(() => {
        expect(context._scroll).toHaveBeenCalled();
        done();
      }, throttleTime);
    });
  });

  class PageObject {
    getEl(cls: string): HTMLElement {
      const el = dl.query(By.css(cls));
      expect(el).not.toBeNull();
      return el.nativeElement as HTMLElement;
    }

    to(href: string = '#何时使用'): this {
      this.getEl(`tri-affix a[href="${href}"]`).click();
      fixture.detectChanges();
      return this;
    }

    scrollTo(href: string = '#何时使用'): this {
      const toNode = dl.query(By.css(href));
      (toNode.nativeElement as HTMLElement).scrollIntoView();
      fixture.detectChanges();
      return this;
    }
  }

});

@Component({
  template: `
  <tri-anchor
    [affix]="affix"
    [bounds]="bounds"
    [showInkInFixed]="showInkInFixed"
    [offsetTop]="offsetTop"
    [target]="target"
    (click)="_click($event)" (scroll)="_scroll($event)">
    <tri-anchor-link href="#何时使用" title="何时使用"></tri-anchor-link>
    <tri-anchor-link href="#basic" title="Basic demo"></tri-anchor-link>
    <tri-anchor-link href="#API-AnchorLink">
      <ng-template triAnchorLinkTemplate>
        <span class="template-title">tpl</span>
      </ng-template>
    </tri-anchor-link>
    <tri-anchor-link href="#API" title="API">
      <tri-anchor-link href="#API-Anchor" title="tri-anchor"></tri-anchor-link>
      <tri-anchor-link href="#API-AnchorLink" [title]="title">
        <!-- 
        <ng-template #title>
          <span class="title-title">tpl-title</span>
        </ng-template>
        -->
      </tri-anchor-link>
    </tri-anchor-link>
    <tri-anchor-link href="#invalid" title="invalid"></tri-anchor-link>
    <tri-anchor-link href="invalidLink" title="invalidLink"></tri-anchor-link>
    <tri-anchor-link href="http://www.example.com/#id" title="complete" class="mock-complete"></tri-anchor-link>
    <tri-anchor-link href="#parallel1" title="parallel1"></tri-anchor-link>
    <tri-anchor-link href="#parallel2" title="parallel2"></tri-anchor-link>
  </tri-anchor>
  <h2 id="何时使用"></h2>
  <div style="height: 1000px">何时使用</div>
  <h2 id="basic"></h2>
  <div style="height: 100px">basic</div>
  <h2 id="API"></h2>
  <div style="height: 100px">API</div>
  <h2 id="API-Anchor"></h2>
  <div style="height: 100px">API-Anchor</div>
  <h2 id="API-AnchorLink">API-AnchorLink</h2>
  <table>
    <tr>
      <td><h2 id="parallel1">parallel1</h2></td>
      <td><h2 id="parallel2">parallel2</h2></td>
    </tr>
  </table>
  <div style="height: 1000px"></div>
  `
})
export class TestComponent {
  @ViewChild(AnchorComponent, {static: false}) comp: AnchorComponent;
  affix = true;
  bounds = 5;
  offsetTop = 0;
  showInkInFixed = false;
  target = null;

  _click() {
  }

  _scroll() {
  }
}
