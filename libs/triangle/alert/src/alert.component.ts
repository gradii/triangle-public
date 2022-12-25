/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import {
  ChangeDetectionStrategy, Component, ContentChild, EventEmitter, Input, Output, TemplateRef,
  ViewEncapsulation
} from '@angular/core';
import { FadeAnimation } from '@gradii/triangle/core';
import { coerceToBoolean } from '@gradii/triangle/util';
import { AlertDescriptionDirective, AlertMessageDirective } from './alert.directive';


@Component({
  selector       : 'tri-alert',
  animations     : [FadeAnimation],
  encapsulation  : ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template       : `
    <div
      [class.tri-alert]="true"
      [class.tri-alert-error]="type==='error'"
      [class.tri-alert-success]="type==='success'"
      [class.tri-alert-info]="type==='info'"
      [class.tri-alert-warning]="type==='warning'"
      [class.tri-alert-no-icon]="!showIcon"
      [class.tri-alert-banner]="banner"
      [class.tri-alert-with-description]="!!this.description"
      *ngIf="display" [@fadeAnimation]>
      <ng-container *ngIf="showIcon">
        <div class="tri-alert-icon">
          <ng-template [ngIf]="description">
            <ng-container [ngSwitch]="type">
              <tri-icon *ngSwitchCase="'error'" svgIcon="outline:close-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'success'" svgIcon="outline:check-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'info'" svgIcon="outline:info-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'warning'" svgIcon="outline:exclamation-circle"></tri-icon>
            </ng-container>
          </ng-template>
          <ng-template [ngIf]="!description">
            <ng-container [ngSwitch]="type">
              <tri-icon *ngSwitchCase="'error'" svgIcon="fill:close-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'success'" svgIcon="fill:check-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'info'" svgIcon="fill:info-circle"></tri-icon>
              <tri-icon *ngSwitchCase="'warning'" svgIcon="fill:exclamation-circle"></tri-icon>
            </ng-container>
          </ng-template>
        </div>
      </ng-container>
      <div>
        <span class="tri-alert-message" *ngIf="message">
          <ng-container *ngIf="isMessageString; else messageTemplate">{{ message }}</ng-container>
          <ng-template #messageTemplate>
            <ng-template [stringTemplateOutlet]="message"></ng-template>
          </ng-template>
        </span>
        <span class="tri-alert-description" *ngIf="description">
          <ng-container
            *ngIf="isDescriptionString; else descriptionTemplate">{{ description }}</ng-container>
          <ng-template #descriptionTemplate>
            <ng-template [stringTemplateOutlet]="description"></ng-template>
          </ng-template>
        </span>
      </div>
      <a
        *ngIf="closeable || closeText"
        (click)="closeAlert($event)"
        class="tri-alert-close-icon">
        <ng-template #closeDefaultTemplate>
          <tri-icon class="anticon-cross" svgIcon="outline:close"></tri-icon>
        </ng-template>
        <ng-container *ngIf="closeText; else closeDefaultTemplate">
          <ng-container
            *ngIf="isCloseTextString; else closeTextTemplate">{{ closeText }}</ng-container>
          <ng-template #closeTextTemplate>
            <ng-template [stringTemplateOutlet]="closeText"></ng-template>
          </ng-template>
        </ng-container>
      </a>
    </div>
  `,
  styleUrls      : ['../style/alert.scss'],
})
export class AlertComponent {

  display       = true;
  isTypeSet     = false;
  isShowIconSet = false;
  isDescriptionString: boolean;
  isMessageString: boolean;
  isCloseTextString: boolean;

  @Output() onClose: EventEmitter<boolean> = new EventEmitter();

  // @Input() iconType: NgClass;

  @ContentChild(AlertMessageDirective, {read: TemplateRef, static: true})
  set messageTemplateRef(value: TemplateRef<any>) {
    if (value instanceof TemplateRef) {
      this.message = value;
    }
  }

  @ContentChild(AlertDescriptionDirective, {read: TemplateRef, static: true})
  set descriptionTemplateRef(value: TemplateRef<any>) {
    if (value instanceof TemplateRef) {
      this.description = value;
    }
  }

  constructor() {
  }

  private _banner = false;

  get banner(): boolean {
    return this._banner;
  }

  @Input()
  set banner(value: boolean) {
    this._banner = coerceToBoolean(value);
    if (!this.isTypeSet) {
      this.type = 'warning';
    }
    if (!this.isShowIconSet) {
      this.showIcon = true;
    }
  }

  private _closeable = false;

  /**
   * whether Alert can be closed
   */
  get closeable(): boolean {
    return this._closeable;
  }

  @Input()
  set closeable(value: boolean) {
    this._closeable = coerceToBoolean(value);
  }

  private _showIcon = false;

  get showIcon(): boolean {
    return this._showIcon;
  }

  @Input()
  set showIcon(value: boolean) {
    this._showIcon     = coerceToBoolean(value);
    this.isShowIconSet = true;
  }

  private _type = 'info';

  get type(): string {
    return this._type;
  }

  @Input()
  set type(value: string) {
    this._type     = value;
    this.isTypeSet = true;
  }

  private _description: string | TemplateRef<void>;

  get description(): string | TemplateRef<void> {
    return this._description;
  }

  @Input()
  set description(value: string | TemplateRef<void>) {
    this.isDescriptionString = !(value instanceof TemplateRef);
    this._description        = value;
  }

  private _message: string | TemplateRef<void>;

  get message(): string | TemplateRef<void> {
    return this._message;
  }

  @Input()
  set message(value: string | TemplateRef<void>) {
    this.isMessageString = !(value instanceof TemplateRef);
    this._message        = value;
  }

  private _closeText: string | TemplateRef<void>;

  get closeText(): string | TemplateRef<void> {
    return this._closeText;
  }

  @Input()
  set closeText(value: string | TemplateRef<void>) {
    this.isCloseTextString = !(value instanceof TemplateRef);
    this._closeText        = value;
  }

  closeAlert(event?: any): void {
    this.display = false;
    this.onClose.emit(true);
  }

}
