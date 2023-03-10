/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */


import {
  animate, AnimationTriggerMetadata, state, style, transition, trigger,
} from '@angular/animations';

/**
 * Animations used by the TriFormField.
 * @docs-private
 */
export const triFormFieldAnimations: {
  readonly transitionMessages: AnimationTriggerMetadata;
} = {
  /** Animation that transitions the form field's error and hint messages. */
  transitionMessages: trigger('transitionMessages', [
    // TODO(mmalerba): Use angular animations for label animation as well.
    state('enter', style({opacity: 1, transform: 'translateY(0%)'})),
    transition('void => enter', [
      style({opacity: 0, transform: 'translateY(-5px)'}),
      animate('300ms cubic-bezier(0.55, 0, 0.55, 0.2)'),
    ]),
  ]),
};
