import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { CollectionDto, CounterDto } from './input.dto';

describe('CounterDto', () => {
  it('should transform filter attribute into object', async () => {
    const payload = {
      filter: '{"userName": {"$regex": "^test"}}',
    };
    const counterDto = plainToClass(CounterDto, payload);
    const errors = await validate(counterDto);
    expect(errors.length).toBe(0);
  });

  it('should allow payload without any filter', async () => {
    const payload = {};
    const counterDto = plainToClass(CounterDto, payload);
    const errors = await validate(counterDto);
    expect(errors.length).toBe(0);
  });
});

describe('CollectionDto', () => {
  it('should transform filter attribute into object', async () => {
    const payload = {
      filter: '{"userName": {"$regex": "^test"}}',
    };
    const collectionDto = plainToClass(CollectionDto, payload);
    const errors = await validate(collectionDto);
    expect(errors.length).toBe(0);
  });

  it('should allow only string type for sort attribute', async () => {
    const payload = {
      sort: '-createdAt;filename',
    };
    const collectionDto = plainToClass(CollectionDto, payload);
    const errors = await validate(collectionDto);
    expect(errors.length).toBe(0);
  });

  describe('page attribute', () => {
    it('should allow number greater then zero', async () => {
      const payload = {
        page: 1,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
    });

    it('should allow number equal then zero', async () => {
      const payload = {
        page: 0,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
    });

    it('should not allow number less then zero', async () => {
      const payload = {
        page: -1,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).not.toBe(0);
    });

    it('should default to 0 if not given', async () => {
      const payload = {};
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
      expect(collectionDto.page).toBe(0);
    });
  });

  describe('limit attribute', () => {
    it('should allow number greater then zero', async () => {
      const payload = {
        limit: 1,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
    });

    it('should allow number equal zero', async () => {
      const payload = {
        limit: 0,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
    });

    it('should not allow number less then zero', async () => {
      const payload = {
        limit: -1,
      };
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).not.toBe(0);
    });

    it('should default to 10 if not given', async () => {
      const payload = {};
      const collectionDto = plainToClass(CollectionDto, payload);
      const errors = await validate(collectionDto);
      expect(errors.length).toBe(0);
      expect(collectionDto.limit).toBe(10);
    });
  });
});
