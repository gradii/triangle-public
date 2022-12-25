import { DataCollection, DataResultIterator } from '@gradii/triangle/data-table';

describe('data-table', () => {

  describe('data collection', () => {
    let collection: DataCollection<any>;

    beforeEach(() => {
      collection = new DataCollection<any>(new DataResultIterator([]));
    });

    it('create a data collection', () => {
      expect(collection).toEqual(jasmine.any(DataCollection));
    });

  });
});
