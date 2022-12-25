/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import { I18nService } from '@gradii/triangle/i18n';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { emptyImage } from './empty-config';

@Component({
  selector       : 'tri-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
  templateUrl    : './empty.component.html',
  styles         : [`tri-empty {
    display: block;
  }`],
  host           : {
    class: 'tri-empty'
  }
})
export class EmptyComponent implements OnChanges, OnInit, OnDestroy {
  @Input() notFoundImage: string | SafeValue | TemplateRef<void>;
  @Input() notFoundContent: string | TemplateRef<void>;
  @Input() notFoundFooter: string | TemplateRef<void>;

  // NOTE: It would be very hack to use `ContentChild`, because Angular could
  // tell if user actually pass something to <ng-content>.
  // See: https://github.com/angular/angular/issues/12530.
  // I can use a directive but this would expose the name `footer`.
  // @ContentChild(TemplateRef, { static: false }) notFoundFooter: TemplateRef<void>;

  defaultSvg: string | SafeValue = this.sanitizer.bypassSecurityTrustResourceUrl(emptyImage);
  isContentString = false;
  locale: { [key: string]: string } = {};
  private destroy$ = new Subject<void>();

  constructor(private sanitizer: DomSanitizer, private i18n: I18nService, private cdr: ChangeDetectorRef) {
  }

  get shouldRenderContent(): boolean {
    const content = this.notFoundContent;
    return !!(content || typeof content === 'string');
  }

  ngOnChanges(changes: SimpleChanges): void {
    const {notFoundContent} = changes;
    if (notFoundContent) {
      this.isContentString = typeof notFoundContent.currentValue === 'string';
    }
  }

  ngOnInit(): void {
    this.i18n.localeChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.locale = this.i18n.getLocaleData('Empty');
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
