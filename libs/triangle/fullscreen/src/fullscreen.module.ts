import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriButtonModule } from '@gradii/triangle/button';
import { FullscreenComponent } from './fullscreen.component';

@NgModule({
  imports: [
    CommonModule,
    TriButtonModule
  ],
  exports: [
    FullscreenComponent
  ],
  declarations: [
    FullscreenComponent
  ]
})
export class FullscreenModule {
}
