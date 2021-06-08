import { FilterValidationError } from './validation.error';
import { FilterSchemaValidator } from './validator';

describe('Validator', () => {
  describe('Query', () => {
    const validator = new FilterSchemaValidator();

    it('should be valid', async () => {
      const queries = [
        { mimetype: null },
        { mimetype: 'audio' },
        { mimetype: ['audio', 'video'] },
        { mimetype: { $eq: 'audio' } },
        { mimetype: { $regex: '^audio/' } },
        { mimetype: { $in: ['audio/mp3', 'aduio/mp4'] } },
        { mimetype: { $not: { $in: ['audio/mp3', 'aduio/mp4'] } } },
        { $and: [{ mimetype: 'audio' }, { mimetype: 'video' }] },
        {
          $or: [
            {
              $and: [{ mimetype: { $eq: 'audio' } }, { length: 3 }],
            },
            {
              mimetype: { $not: { $regex: 'video' } },
            },
          ],
        },
      ];

      queries.forEach((query) => {
        expect(validator.validate(query)).toBe(true);
      });
    });

    it('should not be valid', async () => {
      const queries = [
        { $unknown: 'audio' },
        { mimetype: { $unknown: 'audio' } },
        { mimetype: { $in: ['audio/mp3', { $eq: 1 }] } },
        { mimetype: { $regex: { $eq: 'video' } } },
        {
          $or: [
            {
              $and: [{ mimetype: { $eq: 'audio' } }, { length: 3 }],
            },
            {
              mimetype: { $regex: { $eq: 'video' } },
            },
          ],
        },
      ];

      queries.forEach((query) => {
        expect(() => validator.validate(query)).toThrow(FilterValidationError);
      });
    });
  });
});
