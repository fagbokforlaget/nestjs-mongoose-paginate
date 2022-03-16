import {
  CollectionDto,
  FilterableParameters,
  SortableParameters,
} from '../input.dto';
import { CollectionResponse, Pagination } from '../output.dto';

type QueryExecutor<T> = {
  exec(): Promise<T>;
  skip(offset: number): QueryExecutor<T>;
  limit(limit: number): QueryExecutor<T>;
  sort(data: SortableParameters): QueryExecutor<T>;
  populate(populate: Populate): QueryExecutor<T>;
};

type Model = {
  countDocuments(query: FilterableParameters): QueryExecutor<number>;
  find<T>(query: FilterableParameters, options?: Options): QueryExecutor<T[]>;
};

type Options = {
  populate?: Populate;
};

type Populate = string | string[];

export class DocumentCollector<T> {
  constructor(private model: Model) {}

  async find(
    query: CollectionDto,
    options?: Options,
  ): Promise<CollectionResponse<T>> {
    const { populate } = options;
    const q = this.model
      .find(query.filter)
      .skip(query.page * query.limit)
      .limit(query.limit)
      .populate(populate);

    if (query.sorter) q.sort(query.sorter);

    const data = (await q.exec()) as T[];
    return {
      data,
      pagination: await this.paginate(query),
    };
  }

  private async paginate(query: CollectionDto) {
    const count: number = await this.count(query.filter);
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

  async count(filter: FilterableParameters): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}
