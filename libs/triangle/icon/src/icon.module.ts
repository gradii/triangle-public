/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICON_REGISTRY_PROVIDER, IconRegistry } from './icon-registry';
import { IconComponent } from './icon.component';
import { FILL_SVG_ICONS } from './icons/fill.svg';
import { OUTLINE_SVG_ICONS } from './icons/outline.svg';
import { TWOTONE_SVG_ICONS } from './icons/twotone.svg';


/**
 * # Icon
 * Semantic vector graphics.
 *
 * #### List of icons
 * We are still adding icons right now, syncing to antd.
 *
 * ```typescript
 * import { TriIconModule } from '@gradii/triangle/icon';
 * ```
 *
 * ### 图标列表
 * > 点击图标复制代码。
 * #### 方向性图标
 * #### 提示建议性图标
 * #### 网站通用图标
 * #### 品牌和标识
 *
 *
 * <!-- example(icon:icon-twotone-example) -->
 * <!-- example(icon:icon-outline-example) -->
 * <!-- example(icon:icon-fill-example) -->
 * <!-- example(icon:icon-example) -->
 */
@NgModule({
  exports     : [IconComponent],
  declarations: [IconComponent],
  providers   : [ICON_REGISTRY_PROVIDER],
})
export class TriIconModule {
  constructor(iconRegistry: IconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconSetLiteralInNamespace('fill', sanitizer.bypassSecurityTrustHtml(FILL_SVG_ICONS));
    iconRegistry.addSvgIconSetLiteralInNamespace('outline', sanitizer.bypassSecurityTrustHtml(OUTLINE_SVG_ICONS));
    iconRegistry.addSvgIconSetLiteralInNamespace('twotone', sanitizer.bypassSecurityTrustHtml(TWOTONE_SVG_ICONS));
  }
}
