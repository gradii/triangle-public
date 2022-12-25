import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AvatarComponent } from '../src/avatar.component';
import { TriAvatarModule } from '../src/avatar.module';

function getType(dl: DebugElement): string {
  const el = dl.nativeElement as HTMLElement;
  if (el.querySelector('img') != null) {
    return 'image';
  }
  if (el.querySelector('.anticon') != null) {
    return 'icon';
  }
  return el.innerText.trim().length === 0 ? '' : 'text';
}

describe('avatar', () => {
  let fixture: ComponentFixture<TestAvatarComponent>;
  let context: TestAvatarComponent;
  let dl: DebugElement;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports     : [TriAvatarModule],
      declarations: [TestAvatarComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(TestAvatarComponent);
    context = fixture.componentInstance;
    dl = fixture.debugElement;
    fixture.detectChanges();
  });

  describe('#src', () => {
    it('#src', () => {
      expect(context).not.toBeNull();
    });
    it('should tolerate error src', fakeAsync(() => {
      expect(getType(dl)).toBe('image');
      expect(context.comp._hasSrc).toBe(true);
      // Manually dispatch error.
      context.src = '';
      context.comp._imgError();
      tick();
      fixture.detectChanges();
      expect(getType(dl)).toBe('icon');
      expect(context.comp._hasSrc).toBe(false);
      context.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==';
      tick();
      fixture.detectChanges();
      expect(context.comp._hasSrc).toBe(true);
      expect(getType(dl)).toBe('image');
      tick();
    }));
  });

  it('#icon', () => {
    context.src = null;
    context.text = null;
    fixture.detectChanges();
    expect(getType(dl)).toBe('icon');
  });

  describe('#text', () => {
    beforeEach(() => {
      context.src = null;
      context.icon = null;
      fixture.detectChanges();
    });
    it('property', () => {
      expect(getType(dl)).toBe('text');
    });
    it('should be normal font-size', fakeAsync(() => {
      context.text = 'a';
      fixture.detectChanges();
      tick();
      const scale = +dl.nativeElement.querySelector('.tri-avatar-string').style.transform.replace(/[^\.0-9]/ig, '');
      expect(scale).toBe(0);
    }));
    it('should be autoset font-size', fakeAsync(() => {
      context.text = 'LongUsername';
      fixture.detectChanges();
      tick();
      const scale = +dl.nativeElement.querySelector('.tri-avatar-string').style.transform.replace(/[^\.0-9]/ig, '');
      expect(scale).toBeLessThan(1);
    }));
  });

  describe('#shape', () => {
    for (const type of ['square', 'circle']) {
      it(type, () => {
        context.shape = type;
        fixture.detectChanges();
        expect(dl.query(By.css(`.tri-avatar-${type}`)) !== null).toBe(true);
      });
    }
  });

  describe('#size', () => {
    for (const item of [{size: 'large', cls: 'lg'}, {size: 'small', cls: 'sm'}]) {
      it(item.size, () => {
        context.size = item.size;
        fixture.detectChanges();
        expect(dl.query(By.css(`.tri-avatar-${item.cls}`)) !== null).toBe(true);
      });
    }
  });

  describe('order: image > icon > text', () => {
    it('image priority', () => {
      expect(getType(dl)).toBe('image');
    });
    it('should be show icon when image loaded error and icon exists', fakeAsync(() => {
      expect(getType(dl)).toBe('image');
      context.comp._imgError();
      tick();
      fixture.detectChanges();
      expect(getType(dl)).toBe('icon');
    }));
    it('should be show text when image loaded error and icon not exists', fakeAsync(() => {
      expect(getType(dl)).toBe('image');
      context.icon = null;
      fixture.detectChanges();
      context.comp._imgError();
      tick();
      fixture.detectChanges();
      expect(getType(dl)).toBe('text');
    }));
    it('should be show empty when image loaded error and icon & text not exists', fakeAsync(() => {
      expect(getType(dl)).toBe('image');
      context.icon = null;
      context.text = null;
      fixture.detectChanges();
      context.comp._imgError();
      tick();
      fixture.detectChanges();
      expect(getType(dl)).toBe('');
    }));
  });
});

@Component({
  template: `
    <tri-avatar #comp
               [shape]="shape"
               [size]="size"
               [icon]="icon"
               [text]="text"
               [src]="src"></tri-avatar>
  `
})
class TestAvatarComponent {
  @ViewChild('comp', {static: false}) comp: AvatarComponent;
  shape = 'square';
  size = 'large';
  icon = 'anticon anticon-user';
  text = 'A';
  src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==`;
}
