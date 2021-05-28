import { plainToClass } from 'class-transformer';
import { FilterValidationError } from './filter/validation.error';
import { CollectionDto } from './input.dto';
import { CollectionProperties } from './property';
import { Expose } from './property.decorator';
import { SortValidationError } from './sorter/validation.error';
import { ValidationPipe } from './validation.pipe';

class User extends CollectionProperties {
  @Expose({ sortable: true, filterable: true })
  name: string;

  @Expose({ filterable: true })
  id?: number;

  @Expose({ name: 'typeName', sortable: true })
  type_name: string;

  unfilterable: string;
}

const userDto = plainToClass(CollectionDto, {
  filter: '{"name": "abc", "typeName": "type"}',
});

const failFilterUserDto = plainToClass(CollectionDto, {
  filter: '{"name": "abc", "type_name": "type"}',
});

const failSortUserDto = plainToClass(CollectionDto, {
  sort: '-createdAt',
});

describe('Validation Pipe', () => {
  describe('with exposed keys', () => {
    it('should have defined properties', async () => {
      const validationPipe = new ValidationPipe(User).transform(userDto, null);
      expect(validationPipe).toHaveProperty('filter');
      expect(validationPipe.filter).toHaveProperty('name');
      expect(validationPipe.filter.name).toEqual('abc');

      expect(validationPipe.filter).toHaveProperty('type_name');
      expect(validationPipe.filter.type_name).toEqual('type');
    });
  });

  describe('with undefined keys', () => {
    it('should have defined properties', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failFilterUserDto, null);

      expect(validationPipe).toThrow(FilterValidationError);
    });

    it('should have defined properties', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failSortUserDto, null);

      expect(validationPipe).toThrow(SortValidationError);
    });
  });
});
