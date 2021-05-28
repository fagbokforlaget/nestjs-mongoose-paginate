import { CollectionProperties } from './property';
import { Expose } from './property.decorator';

class User extends CollectionProperties {
  @Expose({ sortable: true, filterable: true })
  name: string;

  @Expose({ filterable: true })
  id?: number;

  @Expose({ name: 'typeName', sortable: true })
  type_name: string;

  unfilterable: string;
}

describe('Properties', () => {
  describe('Keys', () => {
    describe('with allowed keys', () => {
      it('should have defined properties', async () => {
        expect(Object.keys(User.prototype['__props'])).toContain('name');
        expect(Object.keys(User.prototype['__props'])).toContain('id');
        expect(Object.keys(User.prototype['__props'])).toContain('typeName');
      });

      it('should have options for defined properties with name overriten', async () => {
        expect(Object.keys(User.prototype['__props'])).toContain('typeName');
        expect(User.prototype['__props'].typeName).toHaveProperty('name');
        expect(User.prototype['__props'].typeName.name).toEqual('type_name');
      });

      it('should have options for defined properties', async () => {
        expect(Object.keys(User.prototype['__props'])).toContain('name');
        expect(User.prototype['__props'].name).toHaveProperty('name');
        expect(User.prototype['__props'].name.name).toEqual('name');
      });

      it('should not include not defined properties', () => {
        expect(Object.keys(User.prototype['__props'])).not.toContain(
          'unfilterable',
        );
      });
    });

    describe('Options', () => {
      describe('with allowed keys', () => {
        it('should have defined options', async () => {
          expect(Object.keys(User.prototype['__props'])).toContain('name');
          expect(User.prototype['__props'].name).toHaveProperty('filterable');
          expect(User.prototype['__props'].name.filterable).toBe(true);
          expect(User.prototype['__props'].name).toHaveProperty('sortable');
          expect(User.prototype['__props'].name.sortable).toBe(true);
        });

        it('should have defined options', async () => {
          expect(Object.keys(User.prototype['__props'])).toContain('id');
          expect(User.prototype['__props'].id).toHaveProperty('filterable');
          expect(User.prototype['__props'].id.filterable).toBe(true);
          expect(User.prototype['__props'].id).toHaveProperty('sortable');
          expect(User.prototype['__props'].id.sortable).toBe(false);
        });

        it('should have defined options', async () => {
          expect(Object.keys(User.prototype['__props'])).toContain('typeName');
          expect(User.prototype['__props'].typeName).toHaveProperty(
            'filterable',
          );
          expect(User.prototype['__props'].typeName.filterable).toBe(false);
          expect(User.prototype['__props'].typeName).toHaveProperty('sortable');
          expect(User.prototype['__props'].typeName.sortable).toBe(true);
        });
      });
    });
  });
});
