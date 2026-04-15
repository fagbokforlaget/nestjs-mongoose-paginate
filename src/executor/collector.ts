import {
  Aggregate,
  CollectionDto,
  CounterDto,
  FilterableParameters,
  PipelineStage,
  SortableParameters,
} from '../input.dto';
import { CollectionResponse, Pagination } from '../output.dto';

export type QueryExecutor<T> = {
  exec(): Promise<T>;
  skip(offset: number): QueryExecutor<T>;
  limit(limit: number): QueryExecutor<T>;
  sort(data: SortableParameters): QueryExecutor<T>;
};

export type Model = {
  countDocuments(query: FilterableParameters): QueryExecutor<number>;
  find<T>(query: FilterableParameters): QueryExecutor<T[]>;
  aggregate<T>(pipeline: PipelineStage[]): QueryExecutor<T[]>;
};

export class DocumentCollector<T> {
  constructor(private model: Model) {}

  async aggregate<U>(query: Aggregate): Promise<CollectionResponse<U>> {
    const pipeline: PipelineStage[] = [...query.aggregate];

    const offset = (query.page ?? 0) * (query.limit ?? 10);
    pipeline.push({ $skip: offset });
    pipeline.push({ $limit: query.limit ?? 10 });

    const data = await this.model.aggregate<U>(pipeline).exec();
    const count = await this.aggregateCount(query);

    return {
      data,
      pagination: await this.paginate(query, count),
    };
  }

  async find(query: CollectionDto): Promise<CollectionResponse<T>> {
    const q = this.model
      .find(query.filter ?? {})
      .skip((query.page ?? 0) * (query.limit ?? 10))
      .limit(query.limit ?? 10);

    if (query.sorter) {
      // ensure at least one field is unique for sorting
      // https://jira.mongodb.org/browse/SERVER-51498
      const sortOptions: SortableParameters =
        '_id' in query.sorter ? query.sorter : { ...query.sorter, _id: 'asc' };
      q.sort(sortOptions);
    }

    const data = (await q.exec()) as T[];
    const count = await this.count(query);
    return {
      data,
      pagination: await this.paginate(query, count),
    };
  }

  private async paginate(query: CollectionDto, count: number) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 10;
    const pagination: Pagination = {
      total: count,
      page: page,
      limit: limit,
      next: (page + 1) * limit >= count ? undefined : page + 1,
      prev: page === 0 ? undefined : page - 1,
    };

    return pagination;
  }

  async count(query: CounterDto): Promise<number> {
    return this.model.countDocuments(query.filter ?? {}).exec();
  }

  async aggregateCount(query: Aggregate) {
    const pipeline: PipelineStage[] = [...query.aggregate, { $count: 'total' }];

    const result = await this.model
      .aggregate<{ total: number }>(pipeline)
      .exec();

    return result[0]?.total ?? 0;
  }
}
