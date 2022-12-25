/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { ComponentPortal, Portal, PortalInjector, TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  Type,
  ViewContainerRef,
  ViewEncapsulation
} from '@angular/core';
import { DomSanitizer, SafeValue } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import {
  EMPTY_COMPONENT_NAME,
  EmptyCustomContent,
  EmptySize,
  simpleEmptyImage
} from './empty-config';
import { EmptyService } from './empty.service';

@Component({
  selector: 'tri-embed-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './embed-empty.component.html'
})
export class EmbedEmptyComponent implements OnChanges, OnInit, OnDestroy {
  @Input() componentName: string;
  @Input() specificContent: EmptyCustomContent;

  content?: EmptyCustomContent;
  contentType: 'component' | 'template' | 'string' = 'string';
  contentPortal?: Portal<any>; // tslint:disable-line:no-any
  defaultSvg: string | SafeValue = this.sanitizer.bypassSecurityTrustResourceUrl(simpleEmptyImage);
  size: EmptySize = '';
  subs_: Subscription = new Subscription();

  constructor(
    public emptyService: EmptyService,
    private sanitizer: DomSanitizer,
    private viewContainerRef: ViewContainerRef,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.componentName) {
      this.size = this.getEmptySize(changes.componentName.currentValue);
    }

    if (changes.specificContent && !changes.specificContent.isFirstChange()) {
      this.content = changes.specificContent.currentValue;
      this.renderEmpty();
    }
  }

  ngOnInit(): void {
    const userContent_ = this.emptyService.userDefaultContent$.subscribe(content => {
      this.content = this.specificContent || content;
      this.renderEmpty();
    });

    this.subs_.add(userContent_);
  }

  ngOnDestroy(): void {
    this.subs_.unsubscribe();
  }

  private getEmptySize(componentName: string): EmptySize {
    switch (componentName) {
      case 'table':
      case 'list':
        return 'normal';
      case 'select':
      case 'tree-select':
      case 'cascader':
      case 'transfer':
        return 'small';
      default:
        return '';
    }
  }

  private renderEmpty(): void {
    const content = this.content;

    if (typeof content === 'string') {
      this.contentType = 'string';
    } else if (content instanceof TemplateRef) {
      const context = {$implicit: this.componentName} as any; // tslint:disable-line:no-any
      this.contentType = 'template';
      this.contentPortal = new TemplatePortal(content, this.viewContainerRef, context);
    } else if (content instanceof Type) {
      const context = new WeakMap([[EMPTY_COMPONENT_NAME, this.componentName]]);
      const injector = new PortalInjector(this.injector, context);
      this.contentType = 'component';
      this.contentPortal = new ComponentPortal(content, this.viewContainerRef, injector);
    } else {
      this.contentType = 'string';
      this.contentPortal = undefined;
    }

    this.cdr.markForCheck();
  }
}
