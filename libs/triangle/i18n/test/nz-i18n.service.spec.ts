import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { en_US, I18nService, TriI18nModule, zh_CN } from '@gradii/triangle/i18n';

describe('nz-i18n.service', () => {
  let injector: Injector;
  let srv: I18nService;
  const DEFAULT_LAN = zh_CN;

  beforeEach(() => {
    injector = TestBed.configureTestingModule({
      imports: [TriI18nModule]
    });

    srv = injector.get(I18nService);
  });

  describe('#setLocale', () => {
    // tslint:disable:no-string-literal
    it('should be auto default zh_CN', () => {
      expect(srv.getLocale().locale).toBe(DEFAULT_LAN.locale);
    });
    it('should trigger changed when set different lang', () => {
      spyOn(srv['_change'], 'next');
      expect(srv['_change'].next).not.toHaveBeenCalled();
      srv.setLocale(en_US);
      expect(srv['_change'].next).toHaveBeenCalled();
    });
    it('should not trigger change when set same lang', () => {
      spyOn(srv['_change'], 'next');
      expect(srv['_change'].next).not.toHaveBeenCalled();
      srv.setLocale(zh_CN);
      expect(srv['_change'].next).not.toHaveBeenCalled();
    });
  });

});
