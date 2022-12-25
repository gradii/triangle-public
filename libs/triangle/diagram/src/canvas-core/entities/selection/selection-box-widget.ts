/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { Component, Input } from '@angular/core';
import { SelectionLayerModel } from './selection-layer-model';

@Component({
  selector: 'selection-box-widget',
  template: `
    <div class="selection-box-widget"
         [ngStyle]="{
          'top.px':      layer.box.top,
          'left.px':     layer.box.left,
          'width.px':    layer.box.width,
          'height.px':   layer.box.height
        }">
    </div>
  `,
  styles  : [
    `
      .selection-box-widget {
        position         : absolute;
        background-color : rgba(0, 192, 255, 0.2);
        border           : dashed 2px rgb(0, 192, 255);
      }
    `
  ]
})
export class SelectionBoxWidget {

  @Input()
  layer: SelectionLayerModel;

}
