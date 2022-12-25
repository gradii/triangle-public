import { DOCUMENT, PlatformLocation } from '@angular/common';
import { ReflectiveInjector } from '@angular/core';
import { ScrollService } from '@gradii/triangle/core';

describe('ScrollService', () => {
  const TOP: number = 10;
  let injector: ReflectiveInjector;
  let document: MockDocument;
  let location: MockPlatformLocation;
  let scrollService: ScrollService;

  class MockDocument {
    body = new MockElement();
    documentElement = new MockDocumentElement();
  }

  class MockDocumentElement {
    scrollTop = jasmine.createSpy('scrollTop');
  }

  class MockElement {
    scrollTop = jasmine.createSpy('scrollTop');
  }

  class MockPlatformLocation {
    hash: string;
  }

  beforeEach(() => {
    spyOn(window, 'scrollBy');
  });

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      ScrollService,
      {provide: DOCUMENT, useClass: MockDocument},
      {provide: PlatformLocation, useClass: MockPlatformLocation}
    ]);
    location = injector.get(PlatformLocation);
    document = injector.get(DOCUMENT);
    scrollService = injector.get(ScrollService);
  });

  describe('#setScrollTop', () => {
    it(`should scroll to window ${TOP} x`, () => {
      scrollService.setScrollTop(window, TOP);
      expect(document.body.scrollTop).toBe(TOP);
    });

    it(`should scroll to dom element ${TOP} x`, () => {
      const el = new MockElement();
      scrollService.setScrollTop(<any>el, TOP);
      expect(el.scrollTop).toBe(TOP);
    });
  });
});
