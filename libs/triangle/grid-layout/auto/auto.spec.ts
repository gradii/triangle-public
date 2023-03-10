
import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {Platform} from '@angular/cdk/platform';
import {
  ɵMatchMedia as MatchMedia,
  ɵMockMatchMedia as MockMatchMedia,
  ɵMockMatchMediaProvider as MockMatchMediaProvider,
  SERVER_TOKEN,
  StyleUtils,
} from '@angular/flex-layout/core';

import {customMatchers} from '../../utils/testing/custom-matchers';
import {expectNativeEl, makeCreateTestComponent} from '../../utils/testing/helpers';

import {GridModule} from '../module';

describe('grid auto parent directive', () => {
  let fixture: ComponentFixture<any>;
  let styler: StyleUtils;
  let mediaController: MockMatchMedia;
  let platform: Platform;
  let shouldRun = true;
  const createTestComponent = (template: string, styles?: any) => {
    shouldRun = true;
    fixture = makeCreateTestComponent(() => TestGridAutoComponent)(template, styles);
    inject([StyleUtils, MatchMedia, Platform],
      (_styler: StyleUtils, _matchMedia: MockMatchMedia, _platform: Platform) => {
      styler = _styler;
      mediaController = _matchMedia;
      platform = _platform;

      // TODO(CaerusKaru): Grid tests won't work with Edge 14
      if (_platform.EDGE) {
        shouldRun = false;
      }
    })();
  };

  beforeEach(() => {
    jasmine.addMatchers(customMatchers);

    // Configure testbed to prepare services
    TestBed.configureTestingModule({
      imports: [CommonModule, GridModule],
      declarations: [TestGridAutoComponent],
      providers: [
        MockMatchMediaProvider,
        {provide: SERVER_TOKEN, useValue: true},
      ],
    });
  });

  describe('with static features', () => {
    it('should add auto styles for parent', () => {
      const template = `
              <div gdAuto>
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'row'
      }, styler);
    });

    it('should work with inline grid', () => {
      const template = `
              <div gdAuto gdInline>
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'inline-grid',
        'grid-auto-flow': 'row'
      }, styler);
    });

    it('should work with row values', () => {
      const template = `
              <div gdAuto="row">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'row'
      }, styler);
    });

    it('should work with column values', () => {
      const template = `
              <div gdAuto="column">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'column'
      }, styler);
    });

    it('should work with dense values', () => {
      const template = `
              <div gdAuto="dense">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': platform.EDGE ? 'row dense' : 'dense'
      }, styler);
    });

    it('should filter double dense values', () => {
      const template = `
              <div gdAuto="dense dense">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': platform.EDGE ? 'row dense' : 'dense'
      }, styler);
    });

    it('should work with column dense values', () => {
      const template = `
              <div gdAuto="column dense">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'column dense'
      }, styler);
    });

    it('should work with row dense values', () => {
      const template = `
              <div gdAuto="row dense">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': platform.FIREFOX ? 'dense' : 'row dense',
      }, styler);
    });

    it('should work with invalid direction values', () => {
      const template = `
              <div gdAuto="invalid dense">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': platform.FIREFOX ? 'dense' : 'row dense'
      }, styler);
    });

    it('should work with invalid dense values', () => {
      const template = `
              <div gdAuto="column den5e">
                  <div gdArea="header"></div>
                  <div gdArea="sidebar"></div>
                  <div gdArea="footer"></div>
              </div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'column'
      }, styler);
    });

    it('should add dynamic area styles', () => {
      const template = `
            <div [gdAuto]='auto'></div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'row'
      }, styler);

      fixture.componentInstance.auto = 'column';

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'column'
      }, styler);
    });
  });

  describe('with responsive features', () => {
    it('should add row styles for a child', () => {
      const template = `
              <div gdAuto="row"
                   gdAuto.xs="column"></div>
          `;
      createTestComponent(template);

      if (!shouldRun) {
        return;
      }

      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'row'
      }, styler);

      mediaController.activate('xs');
      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'column'
      }, styler);

      mediaController.activate('md');
      expectNativeEl(fixture).toHaveStyle({
        'display': 'grid',
        'grid-auto-flow': 'row'
      }, styler);
    });
  });

});


// *****************************************************************
// Template Component
// *****************************************************************
@Component({
  selector: 'test-layout',
  template: `<span>PlaceHolder Template HTML</span>`
})
class TestGridAutoComponent {
  auto = 'row';
}
