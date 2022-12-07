import {
  CollectionDto,
  CounterDto,
  FilterableParameters,
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
};

export class DocumentCollector<T> {
  constructor(private model: Model) {}

  async find(query: CollectionDto): Promise<CollectionResponse<T>> {
    const q = this.model
      .find(query.filter)
      .skip(query.page * query.limit)
      .limit(query.limit);

    if (query.sorter) {
      // ensure at least one field is unique for sorting
      // https://jira.mongodb.org/browse/SERVER-51498
      const sortOptions: SortableParameters =
        '_id' in query.sorter ? query.sorter : { ...query.sorter, _id: 'asc' };
      q.sort(sortOptions);
    }

    const data = (await q.exec()) as T[];
    return {
      data,
      pagination: await this.paginate(query),
    };
  }

  private async paginate(query: CollectionDto) {
    const count: number = await this.count(query);
    const pagination: Pagination = {
      total: count,
      page: query.page,
      limit: query.limit,
      next:
        (query.page + 1) * query.limit >= count ? undefined : query.page + 1,
      prev: query.page == 0 ? undefined : query.page - 1,
    };

    return pagination;
  }

  async count(query: CounterDto): Promise<number> {
    return this.model.countDocuments(query.filter).exec();
  }
}
