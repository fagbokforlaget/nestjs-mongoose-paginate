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

class TestSortPropsWithNameChangeDefault extends CollectionProperties {
  @Expose({ name: 'createdAt', sortable: true, default: true })
  readonly created_at: 'desc' | 'asc';

  @Expose({ sortable: true })
  readonly userName: 'desc' | 'asc';

  readonly unsortable: string;
}

class TestSortPropsWithoutDefaults extends CollectionProperties {
  @Expose({ name: 'createdAt', sortable: true })
  readonly created_at: 'desc' | 'asc';

  @Expose({ sortable: true })
  readonly userName: 'desc' | 'asc';

  readonly unsortable: string;
}

describe('Sorter', () => {
  describe('Parser', () => {
    describe('with allowed keys', () => {
      describe('without property name change', () => {
        it('should process known property', () => {
          const sParam = new SorterParser(TestSortProps).parse('userName');

          expect(sParam).toHaveProperty('userName');
          expect(sParam['userName']).toEqual('asc');
        });

        it('should process known property descending', () => {
          const sParam = new SorterParser(TestSortProps).parse('-userName');

          expect(sParam).toHaveProperty('userName');
          expect(sParam['userName']).toEqual('desc');
        });

        it('should respond with default property for empty string', () => {
          const sParam = new SorterParser(TestSortProps).parse('');

          expect(sParam).toHaveProperty('userName');
          expect(sParam['userName']).toEqual('asc');
        });
      });

      describe('with property name change', () => {
        it('should process known property', () => {
          const sParam = new SorterParser(TestSortProps).parse('createdAt');

          expect(sParam).toHaveProperty('created_at');
          expect(sParam['created_at']).toEqual('asc');
        });

        it('should process known property', () => {
          const sParam = new SorterParser(TestSortProps).parse('-createdAt');

          expect(sParam).toHaveProperty('created_at');
          expect(sParam['created_at']).toEqual('desc');
        });

        it('should respond with default property for empty string', () => {
          const sParam = new SorterParser(
            TestSortPropsWithNameChangeDefault,
          ).parse('');

          expect(sParam).toHaveProperty('created_at');
          expect(sParam['created_at']).toEqual('asc');
        });
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

    describe('without default sort provided', () => {
      it('should be created_at property for an empty string', () => {
        const sParam = new SorterParser(TestSortPropsWithoutDefaults).parse('');

        expect(sParam).toHaveProperty('created_at');
        expect(sParam['created_at']).toEqual('asc');
      });

      it('should be created_at property without providing any value', () => {
        const sParam = new SorterParser(TestSortPropsWithoutDefaults).parse();

        expect(sParam).toHaveProperty('created_at');
        expect(sParam['created_at']).toEqual('asc');
      });
    });
  });
});
