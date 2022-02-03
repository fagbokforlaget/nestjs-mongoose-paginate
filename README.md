# nestjs-mongoose-paginate

A pagination, filtering and sorting lib for nestjs v8(for v7 please use < v1.1) using mongoose orm

# Usage

### Exposing properties

Create a class to hold information about filterable and sortable properties
You need to `@Expose` properties of this class. By default none of it is filterable nor sortable.
You should set this parameters explicitly.
In case you want to expose some of the properties with a different name, you need to specify a `name` option in this decorator.

```
import {
  CollectionProperties,
  Expose
} from '@forlagshuset/nestjs-mongoose-paginate';

export class MyCollectionProperties extends CollectionProperties {
  @Expose({ name: 'createdAt', sortable: true })
  readonly created_at: 'desc' | 'asc';

  @Expose({ sortable: true, default: true, filterable: true })
  readonly userName: 'desc' | 'asc';

  readonly unsortable: string;
}
```

### Validation Pipe

```
import {
  CollectionDto,
  ValidationPipe,
  CollectionResponse
} from '@forlagshuset/nestjs-mongoose-paginate';

@Controller()
export class AppController {
  @Get('list')
  async filter(
    @Query(new ValidationPipe(MyCollectionProperties))
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<MyDocument>> {
    return await this.service.list(collectionDto);
  }
}
```

### Document collector usage

```
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  CollectionDto,
  DocumentCollector,
  CollectionResponse
} from '@forlagshuset/nestjs-mongoose-paginate';

@Injectable()
export class AppService {
  constructor(
    @InjectModel('MyModel') private readonly model: Model<MyDocument>,
  )

  async list(
      collectionDto: CollectionDto,
  ): Promise<CollectionResponse<MyDocument>> {
    const collector = new DocumentCollector<MyDocument>(this.model);
    return collector.find(collectionDto);
  }
}
```

# Queries

You may now send a request, like in example below:

```
http://localhost:3000/list?filter={"userName": {"$regex": "^test"}}&sort=-createdAt&page=0&limit=100
```

You need to run the parameters through `urlencode` to be able to parse the query correctly. So the filter part looks more like

`%7B%22userName%22%3A%20%7B%22%24regex%22%3A%20%22%5Etest%22%7D%7D`

### Sort

You can specify more than one field for sorting by providing a list of them separated by a semicolon: `createdAt;userName`.
To use DESC sort order: `-createdAt`.

### Filter

A subset of mongoose query language is supported. Currently only these operators are supported:

`'$eq', '$gt', '$gte', '$in', '$lt', '$lte', '$ne', '$nin', '$and', '$not', '$nor', '$or', '$regex'`
