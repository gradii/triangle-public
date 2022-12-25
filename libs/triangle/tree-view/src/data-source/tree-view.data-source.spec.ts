/**
 *
 */

import { BehaviorSubject, firstValueFrom, tap } from 'rxjs';
import { TreeViewSelectableModel } from './tree-view-selectable-model';
import { TreeViewHierarchyControl } from './tree-view.hierarchy-control';
import { TreeViewHierarchyDataSource } from './tree-view.hierarchy-data-source';

describe('test tree view', () => {
  it('should create', () => {
    expect(true).toBeTruthy();
  });

  it('shoule create data source', () => {
    const dataSource = new TreeViewHierarchyDataSource(
      [],
      new TreeViewHierarchyControl('items'));
    expect(dataSource).toBeTruthy();
  });

  it('shoule create data source', async () => {
    const data: any[] = [
      {
        id   : '001',
        text : 'Furniture',
        items: [
          {id: '002', text: 'Tables & Chairs'},
          {id: '003', text: 'Sofas'},
          {
            id   : '004',
            text : 'Occasional Furniture',
            items: [
              {id: '006', text: 'Bed Linen'},
              {id: '007', text: 'Curtains & Blinds'},
              {id: '008', text: 'Carpets'}
            ]
          }
        ]
      },
      {
        id   : '005',
        text : 'Decor',
        items: [
          {id: '009', text: 'Bed Linen'},
          {id: '010', text: 'Curtains & Blinds'},
          {id: '011', text: 'Carpets'}
        ]
      }
    ];

    const dataSource = new TreeViewHierarchyDataSource(
      data, new TreeViewHierarchyControl('items')
    );

    const list = await firstValueFrom(dataSource.connect(new BehaviorSubject({
      start: 0, end: Infinity
    })).pipe(
      tap(() => {

      })
    ));

    expect(list.length).toBe(2);
  });

  it('test select control', ()=> {
    const treeViewControl = new TreeViewHierarchyControl('items');
    const selectControl   = new TreeViewSelectableModel();

    expect(selectControl.selectedKeys.size).toBe(0);
  })
});