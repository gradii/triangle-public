import { Observable } from 'rxjs';
import { TreeViewCheckModel } from './tree-view-check-model';
import { TreeViewDisableModel } from './tree-view-disable-model';
import { TreeViewExpandModel } from './tree-view-expand-model';
import { TreeViewFilterModel } from './tree-view-filter-model';
import { TreeViewSelectableModel } from './tree-view-selectable-model';
import { TreeViewNode } from './tree-view.data-source.node';


export interface TreeViewBaseControl {
  disableModel: TreeViewDisableModel;
  checkModel: TreeViewCheckModel; // = new TreeViewCheckControl();
  expandModel: TreeViewExpandModel; // = new TreeViewExpandControl();
  selectModel: TreeViewSelectableModel; // = new TreeViewSelectableControl();
  filterModel: TreeViewFilterModel; // = new TreeViewSelectableControl();

  isVisible(node: TreeViewNode): boolean;

  setIsVisible(node: TreeViewNode, visible: boolean): void;

  setMatch(node: TreeViewNode, match: boolean): void;

  isFilterMatch(node: TreeViewNode): boolean;

  isChildFilterMatch(node: TreeViewNode): boolean;

  setChildFilterMatch(node: TreeViewNode, matches: boolean): void;

  hasChildren: (item) => boolean;

  /**
   * prefetch children when data ready.
   * but when set load on demand to true, children will be fetched when user expand node.
   * @param item
   */
  prefetchChildren: (item) => any[];

  fetchChildren: (item) => Observable<any>;

  checkAllNode(): void;

  transformToNode(data: any): TreeViewNode;

  eventBus: Observable<any>;
}