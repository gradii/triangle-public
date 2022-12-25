/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { PlatformModule } from '@angular/cdk/platform';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TriCommonModule } from '@gradii/triangle/core';
import { SidenavContainerComponent } from './sidenav-container.component';
import { SidenavContentComponent } from './sidenav-content.component';
import { SidenavComponent } from './sidenav.component';

/**
 *
 * Angular Material provides two sets of components designed to add collapsible side content (often
 * navigation, though it can be any content) alongside some primary content. These are the sidenav and
 * drawer components.
 *
 *   The sidenav components are designed to add side content to a fullscreen app. To set up a sidenav we
 * use three components: `<tri-sidenav-container>` which acts as a structural container for our content
 * and sidenav, `<tri-sidenav-content>` which represents the main content, and `<tri-sidenav>` which
 * represents the added side content.
 *
 *
 *   The drawer component is designed to add side content to a small section of your app. This is
 * accomplished using the `<tri-drawer-container>`, `<tri-drawer-content>`, and `<tri-drawer>`
 * components, which are analogous to their sidenav equivalents. Rather than adding side content to the
 * app as a whole, these are designed to add side content to a small section of your app. They support
 * almost all of the same features, but do not support fixed positioning.
 *
 *
 * ### Specifying the main and side content
 *
 * Both the main and side content should be placed inside of the `<tri-sidenav-container>`, content
 * that you don't want to be affected by the sidenav, such as a header or footer, can be placed outside
 * of the container.
 *
 *   The side content should be wrapped in a `<tri-sidenav>` element. The `position` property can be used
 * to specify which end of the main content to place the side content on. `position` can be either
 *   `start` or `end` which places the side content on the left or right respectively in left-to-right
 * languages. If the `position` is not set, the default value of `start` will be assumed. A
 *   `<tri-sidenav-container>` can have up to two `<tri-sidenav>` elements total, but only one for any
 *   given side. The `<tri-sidenav>` must be placed as an immediate child of the `<tri-sidenav-container>`.
 *
 *   The main content should be wrapped in a `<tri-sidenav-content>`. If no `<tri-sidenav-content>` is
 * specified for a `<tri-sidenav-container>`, one will be created implicitly and all of the content
 * inside the `<tri-sidenav-container>` other than the `<tri-sidenav>` elements will be placed inside
 * of it.
 *
 *
 *   The following are examples of valid sidenav layouts:
 *
 * ```html
 * <!-- Creates a layout with a left-positioned sidenav and explicit content. -->
 * <tri-sidenav-container>
 *   <tri-sidenav>Start</tri-sidenav>
 *   <tri-sidenav-content>Main</tri-sidenav-content>
 * </tri-sidenav-container>
 * ```
 *
 * ```html
 * <!-- Creates a layout with a left and right sidenav and implicit content. -->
 * <tri-sidenav-container>
 *   <tri-sidenav>Start</tri-sidenav>
 *   <tri-sidenav position="end">End</tri-sidenav>
 *   <section>Main</section>
 * </tri-sidenav-container>
 * ```
 *
 * ```html
 * <!-- Creates an empty sidenav container with no sidenavs and implicit empty content. -->
 * <tri-sidenav-container></tri-sidenav-container>
 * ```
 *
 * And these are examples of invalid sidenav layouts:
 *
 * ```html
 * <!-- Invalid because there are two `start` position sidenavs. -->
 * <tri-sidenav-container>
 *   <tri-sidenav>Start</tri-sidenav>
 *   <tri-sidenav position="start">Start 2</tri-sidenav>
 * </tri-sidenav-container>
 * ```
 *
 * ```html
 * <!-- Invalid because there are multiple `<tri-sidenav-content>` elements. -->
 * <tri-sidenav-container>
 *   <tri-sidenav-content>Main</tri-sidenav-content>
 *   <tri-sidenav-content>Main 2</tri-sidenav-content>
 * </tri-sidenav-container>
 * ```
 *
 * ```html
 * <!-- Invalid because the `<tri-sidenav>` is outside of the `<tri-sidenav-container>`. -->
 * <tri-sidenav-container></tri-sidenav-container>
 * <tri-sidenav></tri-sidenav>
 * ```
 *
 * These same rules all apply to the drawer components as well.
 *
 * ### Opening and closing a sidenav
 *
 * A `<tri-sidenav>` can be opened or closed using the `open()`, `close()` and `toggle()` methods. Each
 * of these methods returns a `Promise<boolean>` that will be resolved with `true` when the sidenav
 * finishes opening or `false` when it finishes closing.
 *
 *   The opened state can also be set via a property binding in the template using the `opened` property.
 *   The property supports 2-way binding.
 *
 *   `<tri-sidenav>` also supports output properties for just open and just close events, The `(opened)`
 * and `(closed)` properties respectively.
 *
 *
 *   All of these properties and methods work on `<tri-drawer>` as well.
 *
 * ### Changing the sidenav's behavior
 *
 * The `<tri-sidenav>` can render in one of three different ways based on the `mode` property.
 *
 * | Mode   | Description                                                                             |
 * |--------|-----------------------------------------------------------------------------------------|
 * | `over` | Sidenav floats over the primary content, which is covered by a backdrop                 |
 * | `push` | Sidenav pushes the primary content out of its way, also covering it with a backdrop     |
 * | `side` | Sidenav appears side-by-side with the main content, shrinking the main content's width to make space for the sidenav. |
 *
 * If no `mode` is specified, `over` is used by default.
 *
 *
 * The `over` and `push` sidenav modes show a backdrop by default, while the `side` mode does not. This
 * can be customized by setting the `hasBackdrop` property on `tri-sidenav-container`. Explicitly
 * setting `hasBackdrop` to `true` or `false` will override the default backdrop visibility setting for
 *   all sidenavs regadless of mode. Leaving the property unset or setting it to `null` will use the
 * default backdrop visibility for each mode.
 *
 *
 * `<tri-drawer>` also supports all of these same modes and options.
 *
 * ### Disabling automatic close
 *
 * Clicking on the backdrop or pressing the <kbd>Esc</kbd> key will normally close an open sidenav.
 * However, this automatic closing behavior can be disabled by setting the `disableClose` property on
 * the `<tri-sidenav>` or `<tri-drawer>` that you want to disable the behavior for.
 *
 * Custom handling for <kbd>Esc</kbd> can be done by adding a keydown listener to the `<tri-sidenav>`.
 *   Custom handling for backdrop clicks can be done via the `(backdropClick)` output property on
 *   `<tri-sidenav-container>`.
 *
 *
 * ### Resizing an open sidenav
 * By default, Material will only measure and resize the drawer container in a few key moments
 * (on open, on window resize, on mode change) in order to avoid layout thrashing, however there
 * are cases where this can be problematic. If your app requires for a drawer to change its width
 * while it is open, you can use the `autosize` option to tell Material to continue measuring it.
 *   Note that you should use this option **at your own risk**, because it could cause performance
 * issues.
 *
 *
 * ### Setting the sidenav's size
 *
 * The `<tri-sidenav>` and `<tri-drawer>` will, by default, fit the size of its content. The width can
 * be explicitly set via CSS:
 *
 * ```css
 * tri-sidenav {
 *   width: 200px;
 * }
 * ```
 *
 * Try to avoid percent based width as `resize` events are not (yet) supported.
 *
 * ### Fixed position sidenavs
 *
 * For `<tri-sidenav>` only (not `<tri-drawer>`) fixed positioning is supported. It can be enabled by
 * setting the `fixedInViewport` property. Additionally, top and bottom space can be set via the
 *   `fixedTopGap` and `fixedBottomGap`. These properties accept a pixel value amount of space to add at
 * the top or bottom.
 *
 *
 * ### Creating a responsive layout for mobile & desktop
 *
 *   A sidenav often needs to behave differently on a mobile vs a desktop display. On a desktop, it may
 * make sense to have just the content section scroll. However, on mobile you often want the body to be
 * the element that scrolls; this allows the address bar to auto-hide. The sidenav can be styled with
 *   CSS to adjust to either type of device.
 *
 *
 * ### Reacting to scroll events inside the sidenav container
 *
 * To react to scrolling inside the `<tri-sidenav-container>`, you can get a hold of the underlying
 *   `CdkScrollable` instance through the `TriSidenavContainer`.
 *
 * ```ts
 * class YourComponent implements AfterViewInit {
 *   @ViewChild(TriSidenavContainer) sidenavContainer: TriSidenavContainer;
 *
 *   ngAfterViewInit() {
 *     this.sidenavContainer.scrollable.elementScrolled().subscribe(() => /!* react to scrolling *!/);
 *   }
 * }
 * ```
 *
 * ### Accessibility
 *
 * The `<tri-sidenav>` an `<tri-sidenav-content>` should each be given an appropriate `role` attribute
 * depending on the context in which they are used.
 *
 *   For example, a `<tri-sidenav>` that contains links
 * to other pages might be marked `role="navigation"`, whereas one that contains a table of
 * contents about might be marked as `role="directory"`. If there is no more specific role that
 * describes your sidenav, `role="region"` is recommended.
 *
 *   Similarly, the `<tri-sidenav-content>` should be given a role based on what it contains. If it
 * represents the primary content of the page, it may make sense to mark it `role="main"`. If no more
 * specific role makes sense, `role="region"` is again a good fallback.
 *
 * ### Troubleshooting
 *
 * #### Error: A drawer was already declared for 'position="..."'
 *
 *   This error is thrown if you have more than one sidenav or drawer in a given container with the same
 *   `position`. The `position` property defaults to `start`, so the issue may just be that you forgot to
 * mark the `end` sidenav with `position="end"`.
 *
 * <!-- example(sidenav:sidenav-responsive-example) -->
 * <!-- example(sidenav:sidenav-position-example) -->
 * <!-- example(sidenav:sidenav-overview-example) -->
 * <!-- example(sidenav:sidenav-open-close-example) -->
 * <!-- example(sidenav:sidenav-mode-example) -->
 * <!-- example(sidenav:sidenav-harness-example) -->
 * <!-- example(sidenav:sidenav-fixed-example) -->
 * <!-- example(sidenav:sidenav-drawer-overview-example) -->
 * <!-- example(sidenav:sidenav-disable-close-example) -->
 * <!-- example(sidenav:sidenav-backdrop-example) -->
 * <!-- example(sidenav:sidenav-autosize-example) -->
 */
@NgModule({
  imports     : [
    CommonModule,
    TriCommonModule,
    PlatformModule,
    CdkScrollableModule,
  ],
  exports     : [
    CdkScrollableModule,
    TriCommonModule,
    SidenavComponent,
    SidenavContainerComponent,
    SidenavContentComponent,
  ],
  declarations: [
    SidenavComponent,
    SidenavContainerComponent,
    SidenavContentComponent,
  ],
})
export class TriSidenavModule {
}
