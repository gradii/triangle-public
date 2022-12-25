/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license
 */

import { coerceElement } from '@angular/cdk/coercion';
import { DndContainerRef } from '../drag-drop-ref/dnd-container-ref';


// Order a list of DropContainerRef so that for nested pairs, the outer DropContainerRef
// is preceding the inner DropContainerRef. Should probably be ammended to also
// sort by Z-level.
export function orderByHierarchy(refs: DndContainerRef[]) {
    // Build a map from HTMLElement to DropContainerRef
    const refsByElement: Map<HTMLElement, DndContainerRef> = new Map();
    refs.forEach(ref => {
        refsByElement.set(coerceElement(ref.element), ref);
    });

    // Function to identify the closest ancestor among th DropContainerRefs
    const findAncestor = (ref: DndContainerRef) => {
        let ancestor = coerceElement(ref.element).parentElement;

        while (ancestor) {
            if (refsByElement.has(ancestor)) {
                return refsByElement.get(ancestor);
            }
            ancestor = ancestor.parentElement;
        }

        return undefined;
    };

    // Node type for tree structure
    type NodeType = { ref: DndContainerRef, parent?: NodeType, children: NodeType[] };

    // Add all refs as nodes to the tree
    const tree: Map<DndContainerRef, NodeType> = new Map();
    refs.forEach(ref => {
        tree.set(ref, { ref: ref, children: [] });
    });

    // Build parent-child links in tree
    refs.forEach(ref => {
        const parent = findAncestor(ref);

        if (parent) {
            const node = tree.get(ref);
            const parentNode = tree.get(parent);

            node!.parent = parentNode;
            parentNode!.children.push(node!);
        }
    });

    // Find tree roots
    const roots = Array.from(tree.values()).filter(node => !node.parent);

    // Function to recursively build ordered list from roots and down
    const buildOrderedList = (nodes: NodeType[], list: DndContainerRef[]) => {
        list.push(...nodes.map(node => node.ref));
        nodes.forEach(node => { buildOrderedList(node.children, list); });
    };

    // Build and return the ordered list
    const ordered: DndContainerRef[] = [];
    buildOrderedList(roots, ordered);
    return ordered;
}
