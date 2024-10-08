import { CollectionProperties } from '../property';
import { Expose } from '../property.decorator';
import { FilterParser } from './parser';
import { FilterValidationError } from './validation.error';

class User extends CollectionProperties {
  @Expose({ filterable: true })
  name: string;

  @Expose({ filterable: true })
  id?: number;

  @Expose({ name: 'typeName', filterable: true })
  type_name: string;

  @Expose({ filterable: false })
  unfilterable: string;
}

describe('Filter', () => {
  describe('Parser', () => {
    describe('with allowed keys', () => {
      it('should process known property', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { name: 'image' },
        });

        expect(filterParams).toHaveProperty('name');
        expect(filterParams.name).toEqual('image');
      });

      it('should process known property', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { id: 1 },
        });

        expect(filterParams).toHaveProperty('id');
        expect(filterParams.id).toEqual(1);
      });

      it('should process property with null values', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { id: null },
        });

        expect(filterParams).toHaveProperty('id');
        expect(filterParams.id).toEqual(null);
      });

      it('should process known property with nested allowed key', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { name: { $regex: '^image/' } },
        });

        expect(filterParams).toHaveProperty('name');
        expect(filterParams.name).toEqual({ $regex: '^image/' });
      });

      it('should process known property inside allowed key', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { $or: [{ name: { $regex: '^image/' } }] },
        });

        expect(filterParams).toHaveProperty('$or');
        expect(filterParams.$or).toHaveProperty('length');
        expect((filterParams.$or as []).length).toEqual(1);
      });

      it('should throw an error for unknown property', async () => {
        expect(() =>
          new FilterParser(User).parse({
            filter: { unknown: { $regex: '^image/' } },
          }),
        ).toThrow(FilterValidationError);
      });

      it('should rename property', async () => {
        const filterParams = new FilterParser(User).parse({
          filter: { typeName: { $regex: '^image/' } },
        });

        expect(filterParams).toHaveProperty('type_name');
      });
    });

    describe('with not allowed keys', () => {
      it('should throw error', async () => {
        expect(() =>
          new FilterParser(User).parse({
            filter: { name: { $unknown: '^image/' } },
          }),
        ).toThrow(FilterValidationError);
      });

      it('should process known property inside allowed key', async () => {
        expect(() =>
          new FilterParser(User).parse({
            filter: { $or: [{ name: { $unknown: '^image/' } }] },
          }),
        ).toThrow(FilterValidationError);
      });
    });
  });
});
