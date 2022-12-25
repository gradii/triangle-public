import { Subject } from 'rxjs';
import { DEFAULT_FILTER_SETTINGS, TreeViewFilterSettings } from '../tree-view-filter-settings';
import { makeAllVisible, matchByFieldAndCase, setParentChain } from '../utils';
import { TreeViewNode } from './tree-view.data-source.node';

export type TreeViewFilterMode = '';

export class TreeViewFilterEvent {
  constructor(
    public nodes: TreeViewNode[],
    // public matchCount: number,
    public term: string,
  ) {
  }
}

function filterTree(
  items: TreeViewNode[],
  term,
  {operator, ignoreCase, mode}: TreeViewFilterSettings,
  textField,
  depth = 0
) {
  const field = typeof textField === 'string' ? textField : textField[depth];
  items.forEach((item) => {
    const matcher = typeof operator === 'string' ?
      matchByFieldAndCase(field, operator, ignoreCase) :
      operator;
    const isMatch = matcher(item.dataItem, term);

    item.isMatch            = isMatch;
    item.isVisible          = isMatch;
    item.isChildFilterMatch = false;
    if (isMatch) {
      setParentChain(item.parentNode);
    }
    if (item.loadedChildren && item.loadedChildren.length > 0) {
      if (mode === 'strict' || !isMatch) {
        filterTree(item.loadedChildren, term, {operator, ignoreCase, mode}, textField, depth + 1);
      } else {
        makeAllVisible(item.loadedChildren);
      }
    }
  });
}

/**
 *
 */
export class TreeViewFilterModel {
  filterable: boolean;

  filterKey: string;

  filterMode: TreeViewFilterMode;

  filterData: TreeViewNode[];
  // visibleNodes: Set<any> = new Set();

  filterStateChange: Subject<any> = new Subject();

  constructor() {
  }

  _filterSettings: any = DEFAULT_FILTER_SETTINGS;

  /**
   * The settings which are applied when performing a filter on the component's data.
   */
  // @Input()
  get filterSettings(): TreeViewFilterSettings {
    return this._filterSettings;
  }

  set filterSettings(settings: TreeViewFilterSettings) {
    this._filterSettings = Object.assign({}, DEFAULT_FILTER_SETTINGS, settings);
  }

  /**
   * @hidden
   */
  handleFilterChange(term: string) {
    if (!this.filterData) {
      return;
    }
    this.resetNodesVisibility(this.filterData);
    if (term) {
      filterTree(this.filterData, term, this.filterSettings, this.filterKey);
    }
    // this.updateVisibleNodes(this.filterData);

    this.filterStateChange.next(new TreeViewFilterEvent(
      this.filterData,/* this.visibleNodes.size,*/
      term/*, this.filterSettings*/
    ));
  }

  // updateVisibleNodes(items: TreeViewNode[]) {
  //   items.forEach((item) => {
  //     if (item.isVisible) {
  //       this.visibleNodes.add(item.dataItem);
  //     }
  //     if (item.loadedChildren) {
  //       this.updateVisibleNodes(item.loadedChildren);
  //     }
  //   });
  // }

  resetNodesVisibility(items: TreeViewNode[]) {
    // this.visibleNodes.clear();
    items.forEach((item) => {
      item.isVisible = true;
      if (item.loadedChildren) {
        this.resetNodesVisibility(item.loadedChildren);
      }
    });
  }

}