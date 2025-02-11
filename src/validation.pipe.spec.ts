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

describe('Validation Pipe', () => {
  describe('with exposed keys', () => {
    const userDto = plainToClass(CollectionDto, {
      filter: '{"name": "abc", "id": 1}',
      sort: '-name',
    });

    it('should have defined properties', async () => {
      const validationPipe = new ValidationPipe(User).transform(userDto, null);

      expect(validationPipe).toHaveProperty('filter');
      expect(validationPipe.filter).toEqual({ name: 'abc', id: 1 });
      expect(validationPipe).toHaveProperty('sorter');
      expect(validationPipe.sorter).toHaveProperty('name');
    });
  });

  describe('with undefined keys', () => {
    const failFilterUserDto = plainToClass(CollectionDto, {
      filter: '{"type_name": "type"}',
    });
    const failSortUserDto = plainToClass(CollectionDto, {
      sort: '-createdAt',
    });

    it('should throw FilterValidationError', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failFilterUserDto, null);

      expect(validationPipe).toThrow(FilterValidationError);
    });

    it('should throw SortValidationError', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failSortUserDto, null);

      expect(validationPipe).toThrow(SortValidationError);
    });
  });

  describe('with unavailable keys', () => {
    const failFilterUserDto = plainToClass(CollectionDto, {
      filter: '{"typeName": "type"}',
    });
    const failSortUserDto = plainToClass(CollectionDto, {
      sort: '-id',
    });

    it('should throw FilterValidationError', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failFilterUserDto, null);

      expect(validationPipe).toThrow(FilterValidationError);
    });

    it('should throw SortValidationError', async () => {
      const validationPipe = () =>
        new ValidationPipe(User).transform(failSortUserDto, null);

      expect(validationPipe).toThrow(SortValidationError);
    });
  });
});
