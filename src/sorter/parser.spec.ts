/* eslint-disable @typescript-eslint/ban-ts-comment */

import { CollectionProperties } from '../property';
import { Expose } from '../property.decorator';
import { SorterParser } from './parser';
import { SortValidationError } from './validation.error';

class TestSortProps extends CollectionProperties {
  @Expose({ name: 'createdAt', sortable: true })
  readonly created_at: 'desc' | 'asc';

  @Expose({ sortable: true, default: true })
  readonly userName: 'desc' | 'asc';

  readonly unsortable: string;
}

describe('Sorter', () => {
  describe('Parser', () => {
    describe('with allowed keys', () => {
      it('should process known property', () => {
        const sParam = new SorterParser(TestSortProps).parse('userName');

        expect(sParam).toHaveProperty('userName');
        expect(sParam['userName']).toEqual('asc');
      });

      it('should process known property with the prop name change', () => {
        const sParam = new SorterParser(TestSortProps).parse('createdAt');

        expect(sParam).toHaveProperty('created_at');
        expect(sParam['created_at']).toEqual('asc');
      });

      it('should process known property descending', () => {
        const sParam = new SorterParser(TestSortProps).parse('-userName');

        expect(sParam).toHaveProperty('userName');
        expect(sParam['userName']).toEqual('desc');
      });

      it('should process known property with the prop name change', () => {
        const sParam = new SorterParser(TestSortProps).parse('-createdAt');

        expect(sParam).toHaveProperty('created_at');
        expect(sParam['created_at']).toEqual('desc');
      });

      it('should process known property with the prop name change', () => {
        const sParam = new SorterParser(TestSortProps).parse('');

        expect(sParam).toHaveProperty('userName');
        expect(sParam['userName']).toEqual('asc');
      });
    });

    describe('with unknown keys', () => {
      it('should throw an error when parsing unknown key', () => {
        const sorter = () => {
          new SorterParser(TestSortProps).parse('-updatedAt');
        };
        expect(sorter).toThrow(SortValidationError);
      });
    });
  });
});
