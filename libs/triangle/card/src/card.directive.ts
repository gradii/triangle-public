/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Directive, Input } from '@angular/core';

/**
 * Action section of a card, needed as it's used as a selector in the API.
 */
@Directive({
  selector: 'tri-card-actions, [triCardActions]',
  host    : {
    'class'                             : 'tri-card-actions',
    '[class.tri-card-actions-align-end]': 'align === "end"',
  }
})
export class TriCardActions {
  /** Position of the actions inside the card. */
  @Input() align: 'start' | 'end' = 'start';
}

/**
 * Image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-image, [triCardImage]',
  host    : {'class': 'tri-card-image'}
})
export class TriCardImage {
}

/**
 * Image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-image-small, [triCardImageSmall]',
  host    : {'class': 'tri-card-sm-image'}
})
export class TriCardSmImage {
}

/**
 * Image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-image-medium, [triCardImageMedium]',
})
export class TriCardMdImage {
}

/**
 * Image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-image-large, [triCardImageLarge]',
})
export class TriCardLgImage {
}

/**
 * Large image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-image-x-large, [triCardImageXLarge]',
})
export class TriCardXlImage {
}

/**
 * Avatar image used in a card, needed to add the tri- CSS styling.
 */
@Directive({
  selector: 'tri-card-avatar, [triCardAvatar]',
})
export class TriCardAvatar {
}

@Directive({
  selector: '[triCardGrid], [tri-card-grid]',
  host    : {
    'class': 'tri-card-grid'
  }
})
export class TriCardGrid {
}

