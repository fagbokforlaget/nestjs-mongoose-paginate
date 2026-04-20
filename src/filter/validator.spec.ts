import { FilterValidationError } from './validation.error';
import { FilterSchemaValidator } from './validator';

describe('Validator', () => {
  describe('Query', () => {
    const validator = new FilterSchemaValidator();

    it('should be valid', async () => {
      const queries = [
        { mimetype: null },
        { mimetype: 'audio' },
        { mimetype: ['audio', 'video', true] },
        { mimetype: true },
        { mimetype: { $eq: true } },
        { mimetype: { $eq: 'audio' } },
        { mimetype: { $regex: '^audio/' } },
        { mimetype: { $regex: '^audio/', $options: 'i' } },
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

    it('should be valid Dates', async () => {
      const queries = [
        { createdAt: null },
        { createdAt: '2025-07-07T15:11:59.250Z' },
        { createdAt: ['2025-07-07T15:11:59.250Z', 'video', true] },
        { createdAt: true },
        { createdAt: { $eq: true } },
        { createdAt: { $eq: '2025-07-07T15:11:59.250Z' } },
        { createdAt: { $gt: '2025-07-07T15:11:59.250Z' } },
        { createdAt: { $regex: '^2025-07-07T15:11:59.250Z/' } },
        { createdAt: { $regex: '^2025-07-07T15:11:59.250Z/', $options: 'i' } },
        { createdAt: { $in: ['2025-07-07T15:11:59.250Z', 'aduio/mp4'] } },
        {
          createdAt: {
            $not: { $in: ['2025-07-07T15:11:59.250Z', 'aduio/mp4'] },
          },
        },
        {
          $and: [
            { createdAt: '2025-07-07T15:11:59.250Z' },
            { createdAt: 'video' },
          ],
        },
        {
          $or: [
            {
              $and: [
                { createdAt: { $eq: '2025-07-07T15:11:59.250Z' } },
                { length: 3 },
              ],
            },
            {
              createdAt: { $not: { $regex: '2025-07-07T15:11:59.250Z' } },
            },
          ],
        },
      ];

      queries.forEach((query) => {
        expect(validator.validate(query)).toBe(true);
      });
    });
  });
});
