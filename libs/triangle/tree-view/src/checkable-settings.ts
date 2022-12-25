/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { CheckMode } from './check-mode';

/**
 * The checkable settings of the TreeView
 * ([see example]({% slug checkboxes_tree-view %})).
 *
 * @example
 * {% meta height:610 %}
 * {% embed_file checkable/basic/app.component.ts preview %}
 * {% embed_file checkable/basic/app.module.ts %}
 * {% embed_file shared/main.ts %}
 * {% endmeta %}
 */
export interface CheckableSettings {
  /**
   * Determines if a checkbox selection is allowed.
   * Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * The available values are:
   * * `"single"`
   * * (Default) `"multiple"`
   */
  mode?: CheckMode;
  /**
   * Determines whether to automatically check the children nodes.
   * Defaults to `true`.
   *
   * > The option works only together with the multiple selection mode.
   */
  checkChildren?: boolean;
  /**
   * Determines whether to display the indeterminate state for the parent nodes.
   * Defaults to `true`.
   *
   * > The option works only together with the multiple selection mode.
   */
  checkParents?: boolean;
  /**
   * Specifies if on clicking the node, the item will be checked or unchecked.
   * Defaults to `false`.
   */
  checkOnClick?: boolean;
}
