/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { isPresent } from '@gradii/nanofn';
import { getter, setter } from '@gradii/nanofn';
import { take } from 'rxjs';
import { FlatDataBindingDirective } from '../../flat-binding.directive';
import { copyPageSize, decrementPageSize, incrementPageSize } from '../../load-more/load-more-utils';
import { buildTreeIndex, getDataItem } from '../../utils';
import { collapseEmptyParent, expandDropTarget, updateMovedItemIndex } from '../drag-and-drop-utils';
import { DropPosition, EditService } from '../models';

/**
 * @hidden
 */
export class FlatEditingService implements EditService {
  flatBinding: any;
  movedItemNewIndex: any;

  constructor(flatBinding: FlatDataBindingDirective) {
    this.flatBinding = flatBinding;
  }

  add({sourceItem, destinationItem, dropPosition, sourceTree, destinationTree}) {
    // shallow clone the item as not to mistake it for its 'older' version when the remove handler kicks in to splice the item at its old position
    const clonedSourceDataItem = Object.assign({}, getDataItem(sourceItem));
    if (dropPosition === DropPosition.Over) {
      // expand the item that was dropped into
      expandDropTarget(destinationItem, destinationTree);
      const destinationItemId = getter(getDataItem(destinationItem), this.flatBinding.idField);
      setter(clonedSourceDataItem, this.flatBinding.parentIdField, destinationItemId);
      const lastChildNodeIndex = this.getLastVisibleChildNodeIndex(destinationTree, this.flatBinding.originalData,
        getDataItem(destinationItem));
      // insert after the last visible child
      const targetIndex        = lastChildNodeIndex + 1;
      this.flatBinding.originalData.splice(targetIndex, 0, clonedSourceDataItem);
      // rebind the treeview data before searching for the focus target index
      this.rebindData();
      const focusTarget      = this.fetchChildNodes(getDataItem(destinationItem), destinationTree).indexOf(clonedSourceDataItem);
      this.movedItemNewIndex = buildTreeIndex(destinationItem.item.index, focusTarget);
    } else {
      const shiftIndex  = dropPosition === DropPosition.After ? 1 : 0;
      const targetIndex = this.flatBinding.originalData.indexOf(getDataItem(destinationItem)) + shiftIndex;
      this.flatBinding.originalData.splice(targetIndex, 0, clonedSourceDataItem);
      const destinationItemParentId = getter(getDataItem(destinationItem), this.flatBinding.parentIdField);
      setter(clonedSourceDataItem, this.flatBinding.parentIdField, destinationItemParentId);
      // rebind the treeview data before searching for the focus target index
      this.rebindData();
      const parentIndex      = destinationItem.parent ?
        destinationItem.parent.item.index :
        null;
      const parentContainer  = destinationItem.parent ?
        this.fetchChildNodes(getDataItem(destinationItem.parent), destinationTree) :
        destinationTree.nodes;
      const focusTarget      = parentContainer.indexOf(clonedSourceDataItem);
      this.movedItemNewIndex = buildTreeIndex(parentIndex, focusTarget);
    }
    if (sourceTree !== destinationTree) {
      this.addChildNodes(clonedSourceDataItem, sourceTree);
    }
    // increment the parent page size => an item is moved into it
    const updatedParent = dropPosition === DropPosition.Over ? getDataItem(destinationItem) : getDataItem(destinationItem.parent);
    incrementPageSize(destinationTree, updatedParent);
    // the page sizes are stored by data-item reference => copy the old item ref page size to the new item reference
    copyPageSize(destinationTree, getDataItem(sourceItem), clonedSourceDataItem);
    // the source tree nodes are reloaded on `removeItem` - reload the destination tree nodes if the soruce and the destination tree are different
    if (sourceTree !== destinationTree && !destinationTree.loadOnDemand) {
      destinationTree.preloadChildNodes();
    }
    // if the source and destination trees are the same, focusing the moved item here will not have the desired effect
    // as the `remove` handler has not yet kicked-in to remove the item from its old position
    if (sourceTree !== destinationTree) {
      // ensure the focus target is rendered and registered
      destinationTree.changeDetectorRef.detectChanges();
      destinationTree.focus(this.movedItemNewIndex);
    }
  }

  remove({sourceItem, sourceTree, destinationTree}) {
    const sourceDataItem  = getDataItem(sourceItem);
    const sourceItemIndex = this.flatBinding.originalData.indexOf(sourceDataItem);
    this.flatBinding.originalData.splice(sourceItemIndex, 1);
    if (sourceTree !== destinationTree) {
      this.removeChildNodes(sourceDataItem, sourceTree);
    }
    this.rebindData();
    // emit collapse for the parent node if its last child node was spliced
    const parentChildren = sourceItem.parent ? sourceItem.parent.children : [];
    collapseEmptyParent(sourceItem.parent, parentChildren, sourceTree);
    // decrement source item parent page size => an item has been removed from it
    decrementPageSize(sourceTree, getDataItem(sourceItem.parent));
    // reload the treeview nodes
    if (!sourceTree.loadOnDemand) {
      sourceTree.preloadChildNodes();
    }
    // if the source and destination trees are different we want to focus only the moved item in the destination tree
    if (sourceTree === destinationTree) {
      // ensure the focus target is rendered and registered
      destinationTree.changeDetectorRef.detectChanges();
      // after the source item is removed from its original position, the candidate index might have to be corrected
      const index = updateMovedItemIndex(this.movedItemNewIndex, sourceItem.item.index);
      destinationTree.focus(index);
    }
  }

  addChildNodes(dataItem, source): any {
    const itemChildren = this.fetchAllDescendantNodes(dataItem, source);
    this.flatBinding.originalData.push(...itemChildren);
  }

  removeChildNodes(dataItem, source): any {
    const sourceChildren = this.fetchAllDescendantNodes(dataItem, source);
    sourceChildren.forEach(item => {
      const index = this.flatBinding.originalData.indexOf(item);
      this.flatBinding.originalData.splice(index, 1);
    });
  }

  fetchAllDescendantNodes(node, treeview): any {
    let nodes = this.fetchChildNodes(node, treeview);
    nodes.forEach(node => nodes = nodes.concat(this.fetchAllDescendantNodes(node, treeview) || []));
    return nodes;
  }

  fetchChildNodes(node, treeview): any {
    if (!node) {
      return [];
    }
    let nodes = [];
    treeview
      .children(node)
      .pipe(take(1))
      .subscribe(children => nodes = nodes.concat(children || []));
    return nodes;
  }

  getLastVisibleChildNodeIndex(treeview, data, node): any {
    if (!isPresent(treeview.loadMoreService) || !treeview.hasChildren(node)) {
      return data.length;
    }
    const visibleNodesCount = treeview.loadMoreService.getGroupSize(node);
    const visibleChildren   = this.fetchChildNodes(node, treeview).slice(0, visibleNodesCount);
    const lastNode          = visibleChildren[visibleChildren.length - 1];
    const lastNodeIndex     = data.indexOf(lastNode);
    return lastNodeIndex;
  }

  rebindData(): any {
    this.flatBinding.nodes = this.flatBinding.originalData;
  }
}
