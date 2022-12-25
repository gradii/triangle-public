/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { SafeValue } from '@angular/platform-browser';

@Directive({
  selector: '[stringTemplateOutlet]'
})
export class StringTemplateOutletDirective {
  private _isTemplate: boolean;
  private _inputTemplate: TemplateRef<void> | null = null;
  private _inputViewRef: EmbeddedViewRef<void> | null = null;
  private _defaultViewRef: EmbeddedViewRef<void> | null = null;
  private _outletContext: any;

  constructor(private _viewContainer: ViewContainerRef,
    private _defaultTemplate: TemplateRef<void>) {
  }

  @Input()
  set stringTemplateOutletContext(value: any) {
    this._outletContext = value;
    this.updateView();
  }

  @Input()
  set stringTemplateOutlet(value: string | SafeValue | TemplateRef<void>) {
    if (value instanceof TemplateRef) {
      this._isTemplate = true;
      this._inputTemplate = value as TemplateRef<void>;
    } else {
      this._isTemplate = false;
    }
    this.updateView();
  }

  updateView(): void {
    if (!this._isTemplate) {
      // use default template when input is string
      if (!this._defaultViewRef) {
        this._viewContainer.clear();
        this._inputViewRef = null;
        if (this._defaultTemplate) {
          this._defaultViewRef = this._viewContainer.createEmbeddedView<void>(this._defaultTemplate);
        }
      }
    } else {
      // todo check
      // use input template when input is templateRef
      // if (!this._inputViewRef) {
        this._viewContainer.clear();
        this._defaultViewRef = null;
        if (this._inputTemplate) {
          this._inputViewRef = this._viewContainer.createEmbeddedView<void>(
            this._inputTemplate,
            this._outletContext);
        }
      // }
    }
  }
}
