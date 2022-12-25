/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CalendarI18nInterface } from '@gradii/triangle/i18n';

@Component({
  selector   : 'ok-button',
  templateUrl: './ok-button.component.html'
})

export class OkButtonComponent {
  @Input() locale: CalendarI18nInterface;
  @Input() okDisabled: boolean = false;
  @Output() clickOk = new EventEmitter<void>();

  prefixCls: string = 'tri-calendar';
}
