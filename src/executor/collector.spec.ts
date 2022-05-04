import { DocumentCollector, QueryExecutor, Model } from './collector';

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
  });
});
