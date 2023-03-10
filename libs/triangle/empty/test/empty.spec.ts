import { CommonModule } from '@angular/common';
import { Component, DebugElement, Inject, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, TestBedStatic, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  DEFAULT_EMPTY_CONTENT,
  EmbedEmptyComponent,
  EMPTY_COMPONENT_NAME,
  EmptyComponent,
  EmptyService,
  TriEmptyModule
} from '@gradii/triangle/empty';
import { en_US, I18nService } from '@gradii/triangle/i18n';
import { TriListModule } from '@gradii/triangle/list';

describe('empty', () => {
  describe('basic', () => {
    let testBed: TestBedStatic;
    let fixture: ComponentFixture<EmptyTestBasicComponent>;
    let testComponent: EmptyTestBasicComponent;
    let emptyComponent: DebugElement;

    beforeEach(() => {
      testBed = TestBed.configureTestingModule({
        imports     : [CommonModule, TriEmptyModule],
        declarations: [EmptyTestBasicComponent]
      });

      TestBed.compileComponents();

      fixture = TestBed.createComponent(EmptyTestBasicComponent);
      testComponent = fixture.debugElement.componentInstance;
      emptyComponent = fixture.debugElement.query(By.directive(EmptyComponent));

      fixture.detectChanges();
    });

    it('should render image, description on default situation', () => {
      expect(emptyComponent.nativeElement.classList.contains('tri-empty')).toBe(true);

      const imageEl = emptyComponent.nativeElement.firstChild;
      expect(imageEl.tagName).toBe('DIV');
      expect(imageEl.classList.contains('tri-empty-image')).toBe(true);
      expect(imageEl.firstElementChild.tagName).toBe('IMG');
      expect(imageEl.firstElementChild.getAttribute('alt')).toBe('empty');
      expect(imageEl.firstElementChild.src).toContain('data:image');

      const contentEl = emptyComponent.nativeElement.lastElementChild;
      expect(contentEl.tagName).toBe('P');
      expect(contentEl.innerText.trim()).toBe('暂无数据');
    });

    it('should render image, content and footer as template', () => {
      testComponent.image = testComponent.imageTpl;
      testComponent.content = testComponent.contentTpl;
      testComponent.footer = testComponent.footerTpl;

      fixture.detectChanges();

      expect(emptyComponent.nativeElement.classList.contains('tri-empty')).toBe(true);

      const imageEl = emptyComponent.nativeElement.firstChild;
      expect(imageEl.tagName).toBe('DIV');
      expect(imageEl.classList.contains('tri-empty-image')).toBe(true);
      expect(imageEl.innerText).toBe('Image');

      const contentEl = emptyComponent.nativeElement.querySelector('.tri-empty-description');
      expect(contentEl).not.toBeFalsy();
      expect(contentEl.tagName).toBe('P');
      expect(contentEl.innerText).toBe('Content');

      const footerEl = emptyComponent.nativeElement.lastElementChild;
      expect(footerEl.tagName).toBe('DIV');
      expect(footerEl.classList.contains('tri-empty-footer')).toBe(true);
      expect(footerEl.innerText).toBe('Footer');
    });

    it('should render image, content and footer as string and change `alt`', () => {
      testComponent.image = 'https://ng.ant.design/assets/img/logo.svg';
      testComponent.content = 'zorro icon';
      testComponent.footer = 'Footer';
      fixture.detectChanges();

      expect(emptyComponent.nativeElement.classList.contains('tri-empty')).toBe(true);

      const imageEl = emptyComponent.nativeElement.firstChild;
      expect(imageEl.tagName).toBe('DIV');
      expect(imageEl.classList.contains('tri-empty-image')).toBe(true);
      expect(imageEl.firstElementChild.tagName).toBe('IMG');
      expect(imageEl.firstElementChild.getAttribute('alt')).toBe('zorro icon');
      expect(imageEl.firstElementChild.src).toContain('ng.ant.design');

      const contentEl = emptyComponent.nativeElement.querySelector('.tri-empty-description');
      expect(contentEl).not.toBeFalsy();
      expect(contentEl.tagName).toBe('P');
      expect(contentEl.innerText).toBe('zorro icon');

      const footerEl = emptyComponent.nativeElement.lastElementChild;
      expect(footerEl.tagName).toBe('DIV');
      expect(footerEl.classList.contains('tri-empty-footer')).toBe(true);
      expect(footerEl.innerText).toBe('Footer');
    });

    it('should render empty string as content', () => {
      testComponent.content = '';
      fixture.detectChanges();

      const contentEl = emptyComponent.nativeElement.querySelector('.tri-empty-description');
      expect(contentEl).not.toBeFalsy();
      expect(contentEl.tagName).toBe('P');
      expect(contentEl.innerText).toBe('');
    });

    it('#i18n', () => {
      const contentEl = emptyComponent.nativeElement.lastElementChild;
      expect(contentEl.innerText.trim()).toBe('暂无数据');

      testBed.get(I18nService).setLocale(en_US);
      fixture.detectChanges();
      expect(contentEl.innerText.trim()).toBe('No Data');
    });
  });

  /**
   * Config default empty content via `NzEmptyService`'s `setDefaultEmptyContent` method.
   */
  describe('embed', () => {
    let fixture: ComponentFixture<EmptyTestServiceComponent>;
    let testComponent: EmptyTestServiceComponent;
    let embedComponent: DebugElement;
    let emptyComponent: DebugElement;

    describe('service method', () => {
      beforeEach(() => {
        TestBed.configureTestingModule({
          imports: [EmptyTestServiceModule]
        }).compileComponents();

        fixture = TestBed.createComponent(EmptyTestServiceComponent);
        testComponent = fixture.debugElement.componentInstance;
      });

      it('should components\' prop has priority', fakeAsync(() => {
        const refresh = () => {
          fixture.detectChanges();
          tick();
          fixture.detectChanges();

          embedComponent = fixture.debugElement.query(By.directive(EmbedEmptyComponent));
          emptyComponent = fixture.debugElement.query(By.directive(EmptyComponent));
        };

        refresh();

        // Default.
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeTruthy();
        expect(emptyComponent.nativeElement.classList.contains('tri-empty')).toBe(true);
        expect(emptyComponent.nativeElement.classList.contains('tri-empty-normal')).toBe(true);
        const imageEl = emptyComponent.nativeElement.firstChild;
        expect(imageEl.tagName).toBe('DIV');
        expect(imageEl.classList.contains('tri-empty-image')).toBe(true);
        expect(imageEl.firstElementChild.tagName).toBe('IMG');
        expect(imageEl.firstElementChild.getAttribute('alt')).toBe('empty');
        expect(imageEl.firstElementChild.src).toContain('data:image/svg+xml');

        // Prop.
        testComponent.noResult = 'list';
        refresh();
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeFalsy();
        expect(embedComponent.nativeElement.innerText).toBe('list');

        // Null.
        testComponent.noResult = null;
        refresh();
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeFalsy();
        expect(embedComponent.nativeElement.innerText).toBe('');
      }));

      it('should raise error when set a invalid default value', () => {
        expect(() => {
          // tslint:disable-next-line:no-any
          testComponent.emptyService.setDefaultContent(false as any);
          fixture.detectChanges();
          tick();
          fixture.detectChanges();
        }).toThrowError();
      });

      it('should support string, template and component', fakeAsync(() => {
        const refresh = () => {
          fixture.detectChanges();
          tick();
          fixture.detectChanges();

          embedComponent = fixture.debugElement.query(By.directive(EmbedEmptyComponent));
          emptyComponent = fixture.debugElement.query(By.directive(EmptyComponent));
        };

        // String.
        testComponent.emptyService.setDefaultContent('empty');
        refresh();
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeFalsy();
        expect(embedComponent.nativeElement.innerText).toBe('empty');

        // Template.
        testComponent.changeToTemplate();
        refresh();
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeFalsy();
        const divEl = embedComponent.nativeElement.firstElementChild;
        expect(divEl).toBeTruthy();
        expect(divEl.tagName).toBe('DIV');
        expect(divEl.innerText).toBe('I am in template list');

        // FIXME: This is not supported yet, see https://github.com/angular/angular/issues/15634.
        // Component.
        // testComponent.changeToComponent();
        // refresh();
        // expect(embedComponent).toBeTruthy();
        // expect(emptyComponent).toBeFalsy();
        // const componentEl = embedComponent.nativeElement.nextSibling;
        // expect(componentEl).toBeTruthy();
        // expect(componentEl.tagName).toBe('NZ-EMPTY-TEST-CUSTOM');
        // expect(componentEl.innerText).toBe(`I'm in component list`);

        // Reset.
        testComponent.reset();
        refresh();
        expect(embedComponent).toBeTruthy();
        expect(emptyComponent).toBeTruthy();
        expect(emptyComponent.nativeElement.classList.contains('tri-empty')).toBe(true);
        expect(emptyComponent.nativeElement.classList.contains('tri-empty-normal')).toBe(true);
        const imageEl = emptyComponent.nativeElement.firstChild;
        expect(imageEl.tagName).toBe('DIV');
        expect(imageEl.classList.contains('tri-empty-image')).toBe(true);
        expect(imageEl.firstElementChild.tagName).toBe('IMG');
        expect(imageEl.firstElementChild.getAttribute('alt')).toBe('empty');
        expect(imageEl.firstElementChild.src).toContain('data:image/svg+xml');
      }));

      it('should raise error when set a invalid default value', () => {
        expect(() => {
          // tslint:disable-next-line:no-any
          testComponent.emptyService.setDefaultContent(false as any);
          fixture.detectChanges();
          tick();
          fixture.detectChanges();
        }).toThrowError();
      });
    });

    /**
     * Config default empty content via injection.
     */
    // todo fixme there sames have a bug in detect change component dynamic created
    //
    // describe('service injection', () => {
    //   beforeEach(() => {
    //     TestBed.configureTestingModule({
    //       imports: [EmptyTestInjectionModule]
    //     }).compileComponents();
    //
    //     fixture = TestBed.createComponent(EmptyTestServiceComponent);
    //     testComponent = fixture.debugElement.componentInstance;
    //   });
    //
    //   it('should support injection', fakeAsync(() => {
    //     const refresh = () => {
    //       fixture.detectChanges();
    //       tick();
    //       fixture.detectChanges();
    //
    //       embedComponent = fixture.debugElement.query(By.directive(EmbedEmptyComponent));
    //       emptyComponent = fixture.debugElement.query(By.directive(EmptyComponent));
    //     };
    //
    //     refresh();
    //
    //     // Component.
    //     expect(embedComponent).toBeTruthy();
    //     expect(emptyComponent).toBeFalsy();
    //     const componentEl = embedComponent.nativeElement.nextSibling;
    //     expect(componentEl).toBeTruthy();
    //     expect(componentEl.tagName).toBe('TEST-EMPTY-TEST-CUSTOM');
    //     expect(componentEl.innerText).toBe(`I'm in component list`);
    //   }));
    // });
  });
});

@Component({
  selector: 'test-empty-test-basic',
  template: `
    <tri-empty [notFoundImage]="image" [notFoundContent]="content" [notFoundFooter]="footer">
      <ng-template #imageTpl>Image</ng-template>
      <ng-template #contentTpl>Content</ng-template>
      <ng-template #footerTpl>Footer</ng-template>
    </tri-empty>
  `
})
export class EmptyTestBasicComponent {
  @ViewChild('imageTpl', {static: false}) imageTpl: TemplateRef<void>;
  @ViewChild('contentTpl', {static: false}) contentTpl: TemplateRef<void>;
  @ViewChild('footerTpl', {static: false}) footerTpl: TemplateRef<void>;

  image?: TemplateRef<void> | string;
  content?: TemplateRef<void> | string;
  footer?: TemplateRef<void> | string;
}

@Component({
  selector: 'test-empty-test-service',
  template: `
    <tri-list [dataSource]="[]" [noResult]="noResult"></tri-list>
    <ng-template #tpl let-component>
      <div>I am in template {{ component }}</div>
    </ng-template>
  `
})
export class EmptyTestServiceComponent {
  @ViewChild('tpl', {static: false}) template: TemplateRef<void>;

  noResult?: string | null;

  constructor(public emptyService: EmptyService) {
  }

  reset(): void {
    this.emptyService.resetDefault();
  }

  changeToTemplate(): void {
    this.emptyService.setDefaultContent(this.template);
  }
}

@Component({
  selector: 'test-empty-test-custom',
  template: `
    <div>I'm in component {{ name }}</div>
  `
})
export class EmptyTestCustomComponent {
  constructor(@Inject(EMPTY_COMPONENT_NAME) public name: string) {
  }
}

@NgModule({
  imports     : [CommonModule, TriEmptyModule, TriListModule],
  declarations: [EmptyTestServiceComponent, EmptyTestCustomComponent],
  exports     : [EmptyTestServiceComponent, EmptyTestCustomComponent]
})
export class EmptyTestServiceModule {
}

@NgModule({
  imports     : [CommonModule, TriEmptyModule, TriListModule],
  declarations: [EmptyTestServiceComponent, EmptyTestCustomComponent],
  exports     : [EmptyTestServiceComponent, EmptyTestCustomComponent],
  providers   : [
    {
      provide : DEFAULT_EMPTY_CONTENT,
      useValue: EmptyTestCustomComponent
    }
  ]
})
export class EmptyTestInjectionModule {
}
