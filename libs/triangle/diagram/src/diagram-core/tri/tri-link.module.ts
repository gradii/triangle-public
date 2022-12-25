import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { TriLinkPointWidget } from './link/tri-link-point-widget';
import { TriLinkSegmentWidget } from './link/tri-link-segment-widget';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    TriLinkPointWidget,
    TriLinkSegmentWidget,
  ],
  exports: [
    TriLinkPointWidget,
    TriLinkSegmentWidget,
  ]
})
export class TriLinkModule {

}