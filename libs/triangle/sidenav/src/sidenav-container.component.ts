/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { BooleanInput } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy, Component, ContentChild, ContentChildren, QueryList, ViewEncapsulation
} from '@angular/core';
import { TRI_DRAWER_CONTAINER, TriDrawerContainer } from '@gradii/triangle/drawer';
import { SidenavContentComponent } from './sidenav-content.component';
import { TRI_SIDENAV_CONTAINER } from './sidenav.common';
import { SidenavComponent } from './sidenav.component';


@Component({
  selector       : 'tri-sidenav-container',
  exportAs       : 'triSidenavContainer',
  templateUrl    : 'sidenav-container.html',
  styleUrls      : ['../style/sidenav.scss'],
  host           : {
    'class'                                         : 'tri-drawer-container tri-sidenav-container',
    '[class.tri-drawer-container-explicit-backdrop]': '_backdropOverride',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation  : ViewEncapsulation.None,
  providers      : [
    {
      provide    : TRI_DRAWER_CONTAINER,
      useExisting: SidenavContainerComponent
    },
    {
      provide    : TRI_SIDENAV_CONTAINER,
      useExisting: SidenavContainerComponent
    }
  ]
})
export class SidenavContainerComponent extends TriDrawerContainer {
  static ngAcceptInputType_hasBackdrop: BooleanInput;
  @ContentChildren(SidenavComponent, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true
  })
  _allDrawers: QueryList<SidenavComponent>;
  @ContentChild(SidenavContentComponent) _content: SidenavContentComponent;
}
