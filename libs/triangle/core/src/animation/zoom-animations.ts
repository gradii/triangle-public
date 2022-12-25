/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { AnimationCurves, AnimationDuration } from './animation';

export const ZoomAnimation: AnimationTriggerMetadata = trigger('zoomAnimation', [
  transition(':enter', [
    style({opacity: 0, transform: 'scale(0.2)'}),
    animate(`${AnimationDuration.BASE} ${AnimationCurves.EASE_OUT_CIRC}`,
      style({
        opacity  : 1,
        transform: 'scale(1)'
      })
    )
  ]),
  transition(':leave', [
    style({opacity: 1, transform: 'scale(1)'}),
    animate(`${AnimationDuration.BASE} ${AnimationCurves.EASE_IN_OUT_CIRC}`,
      style({
        opacity  : 0,
        transform: 'scale(0.2)'
      })
    )
  ])
]);
export const ZoomBigAnimation: AnimationTriggerMetadata = trigger('ZoomBigAnimation', [
  transition('void => active', [
    style({opacity: 0, transform: 'scale(0.8)'}),
    animate(`${AnimationDuration.BASE} ${AnimationCurves.EASE_OUT_CIRC}`,
      style({
        opacity  : 1,
        transform: 'scale(1)'
      })
    )
  ]),
  transition('active => void', [
    style({opacity: 1, transform: 'scale(1)'}),
    animate(`${AnimationDuration.BASE} ${AnimationCurves.EASE_IN_OUT_CIRC}`,
      style({
        opacity  : 0,
        transform: 'scale(0.8)'
      })
    )
  ])
]);
export const ZoomBadgeAnimation: AnimationTriggerMetadata = trigger('zoomBadgeMotion', [
  transition(':enter', [
    style({opacity: 0, transform: 'scale(0) translate(50%, -50%)'}),
    animate(`${AnimationDuration.SLOW} ${AnimationCurves.EASE_OUT_BACK}`, style({
      opacity  : 1,
      transform: 'scale(1) translate(50%, -50%)'
    }))
  ]),
  transition(':leave', [
    style({opacity: 1, transform: 'scale(1) translate(50%, -50%)'}),
    animate(`${AnimationDuration.SLOW} ${AnimationCurves.EASE_IN_BACK}`, style({
      opacity  : 0,
      transform: 'scale(0) translate(50%, -50%)'
    }))
  ])
]);
