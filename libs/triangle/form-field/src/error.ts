/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import { Attribute, Directive, ElementRef, InjectionToken, Input } from '@angular/core';

let nextUniqueId = 0;

/**
 * Injection token that can be used to reference instances of `TriError`. It serves as
 * alternative token to the actual `TriError` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const TRI_ERROR = new InjectionToken<TriError>('TriError');

/** Single error message to be shown underneath the form field. */
@Directive({
  selector : 'tri-error',
  host     : {
    'class'      : 'tri-error',
    '[attr.id]'  : 'id',
    'aria-atomic': 'true',
  },
  providers: [{provide: TRI_ERROR, useExisting: TriError}],
})
export class TriError {
  @Input() id: string = `tri-error-${nextUniqueId++}`;

  constructor(@Attribute('aria-live') ariaLive: string, elementRef: ElementRef) {
    // If no aria-live value is set add 'polite' as a default. This is preferred over setting
    // role='alert' so that screen readers do not interrupt the current task to read this aloud.
    if (!ariaLive) {
      elementRef.nativeElement.setAttribute('aria-live', 'polite');
    }
  }
}
