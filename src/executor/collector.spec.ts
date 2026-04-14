import { DocumentCollector, Model, QueryExecutor } from './collector';

const data = [
  { id: 1, name: 'one' },
  { id: 2, name: 'two' },
  { id: 3, name: 'three' },
  { id: 4, name: 'four' },
  { id: 5, name: 'five' },
  { id: 6, name: 'six' },
];
class MyQueryExecutor implements QueryExecutor<any> {
  constructor(private obj: any) {}

  async exec(): Promise<any> {
    return this.obj;
  }
  skip(): MyQueryExecutor {
    return this;
  }
  limit(): MyQueryExecutor {
    return this;
  }
  sort(): MyQueryExecutor {
    return this;
  }
}

class MyModel implements Model {
  countDocuments(): QueryExecutor<number> {
    return new MyQueryExecutor(100);
  }
  find(): MyQueryExecutor {
    return new MyQueryExecutor(data);
  }
  aggregate(): MyQueryExecutor {
    return new MyQueryExecutor(data);
  }
}

describe('Executor', () => {
  describe('Collector', () => {
    it('should return proper paginated data', async () => {
      const model = new MyModel();
      const collector = new DocumentCollector(model);
      const result = await collector.find({
        filter: {},
        sorter: {},
        page: 1,
        limit: 10,
      });

      expect(result).toHaveProperty('data');
      expect(result.data).toEqual(data);
      expect(result).toHaveProperty('pagination');
    });

    describe('aggregate', () => {
      it('should return proper paginated data with aggregate pipeline', async () => {
        const model = new MyModel();
        const collector = new DocumentCollector(model);
        const result = await collector.aggregate({
          aggregate: [{ $match: { name: 'one' } }],
          page: 0,
          limit: 10,
        });

        expect(result).toHaveProperty('data');
        expect(result.data).toEqual(data);
        expect(result).toHaveProperty('pagination');
        expect(result.pagination).toHaveProperty('total');
        expect(result.pagination).toHaveProperty('page');
        expect(result.pagination).toHaveProperty('limit');
      });

      it('should apply skip and limit to aggregate pipeline', async () => {
        const mockAggregate = jest
          .fn()
          .mockReturnValue(new MyQueryExecutor(data));
        const model = new MyModel();
        model.aggregate = mockAggregate;

        const collector = new DocumentCollector(model);
        await collector.aggregate({
          aggregate: [{ $match: { name: 'one' } }],
          page: 2,
          limit: 5,
        });

        // First call for data (with skip and limit)
        expect(mockAggregate).toHaveBeenCalledWith([
          { $match: { name: 'one' } },
          { $skip: 10 },
          { $limit: 5 },
        ]);
      });

      it('should calculate pagination correctly for aggregate', async () => {
        const aggregateData = data.slice(0, 3);
        const mockAggregateResult = jest
          .fn()
          .mockReturnValueOnce(new MyQueryExecutor(aggregateData))
          .mockReturnValueOnce(new MyQueryExecutor([{ total: 13 }]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const result = await collector.aggregate({
          aggregate: [{ $match: { id: { $gte: 1 } } }],
          page: 1,
          limit: 5,
        });

        expect(result.pagination).toEqual({
          total: 13,
          page: 1,
          limit: 5,
          next: 2,
          prev: 0,
        });
      });

      it('should return undefined for next when on last page', async () => {
        const aggregateData = data.slice(0, 2);
        const mockAggregateResult = jest
          .fn()
          .mockReturnValueOnce(new MyQueryExecutor(aggregateData))
          .mockReturnValueOnce(new MyQueryExecutor([{ total: 7 }]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const result = await collector.aggregate({
          aggregate: [{ $match: { id: { $lte: 10 } } }],
          page: 1,
          limit: 5,
        });

        expect(result.pagination.next).toBeUndefined();
      });

      it('should return undefined for prev when on first page', async () => {
        const aggregateData = data.slice(0, 5);
        const mockAggregateResult = jest
          .fn()
          .mockReturnValueOnce(new MyQueryExecutor(aggregateData))
          .mockReturnValueOnce(new MyQueryExecutor([{ total: 20 }]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const result = await collector.aggregate({
          aggregate: [{ $match: { id: { $gte: 1 } } }],
          page: 0,
          limit: 5,
        });

        expect(result.pagination.prev).toBeUndefined();
        expect(result.pagination.next).toBe(1);
      });

      it('should handle empty aggregate results', async () => {
        const mockAggregateResult = jest
          .fn()
          .mockReturnValueOnce(new MyQueryExecutor([]))
          .mockReturnValueOnce(new MyQueryExecutor([]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const result = await collector.aggregate({
          aggregate: [{ $match: { id: { $gt: 1000 } } }],
          page: 0,
          limit: 10,
        });

        expect(result.data).toEqual([]);
        expect(result.pagination.total).toBe(0);
        expect(result.pagination.next).toBeUndefined();
        expect(result.pagination.prev).toBeUndefined();
      });

      it('should preserve original aggregate pipeline', async () => {
        const originalPipeline = [
          { $match: { status: 'active' } },
          { $group: { _id: '$category', total: { $sum: 1 } } },
        ];
        const mockAggregate = jest
          .fn()
          .mockReturnValue(new MyQueryExecutor(data));

        const model = new MyModel();
        model.aggregate = mockAggregate;

        const collector = new DocumentCollector(model);
        await collector.aggregate({
          aggregate: originalPipeline,
          page: 0,
          limit: 10,
        });

        // Verify original pipeline wasn't mutated
        expect(originalPipeline).toEqual([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', total: { $sum: 1 } } },
        ]);

        // Verify collector added skip and limit
        expect(mockAggregate).toHaveBeenCalledWith([
          { $match: { status: 'active' } },
          { $group: { _id: '$category', total: { $sum: 1 } } },
          { $skip: 0 },
          { $limit: 10 },
        ]);
      });
    });

    describe('aggregateCount', () => {
      it('should return count from aggregate pipeline', async () => {
        const mockAggregateResult = jest
          .fn()
          .mockReturnValue(new MyQueryExecutor([{ total: 42 }]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const count = await collector.aggregateCount({
          aggregate: [{ $match: { status: 'active' } }],
          page: 0,
          limit: 10,
        });

        expect(count).toBe(42);
        expect(mockAggregateResult).toHaveBeenCalledWith([
          { $match: { status: 'active' } },
          { $count: 'total' },
        ]);
      });

      it('should return 0 when aggregate count returns empty array', async () => {
        const mockAggregateResult = jest
          .fn()
          .mockReturnValue(new MyQueryExecutor([]));

        const model = new MyModel();
        model.aggregate = mockAggregateResult;

        const collector = new DocumentCollector(model);
        const count = await collector.aggregateCount({
          aggregate: [{ $match: { id: { $gt: 1000 } } }],
          page: 0,
          limit: 10,
        });

        expect(count).toBe(0);
      });
    });
  });
});
