import { Controller, Get, Query } from '@nestjs/common';
import { CollectionResponse } from '../output.dto';
import { CollectionDto } from '../input.dto';
import { CollectionProperties } from '../property';
import { Expose } from '../property.decorator';
import { ValidationPipe } from '../validation.pipe';

export class MyCollectionProperties extends CollectionProperties {
  @Expose({ name: 'createdAt', sortable: true })
  readonly created_at: 'desc' | 'asc';

  @Expose({ sortable: true, default: true, filterable: true })
  readonly userName: 'desc' | 'asc';

  readonly unsortable: string;
}

@Controller('/test')
export class TestController {
  @Get('list')
  async filter(
    @Query(new ValidationPipe(MyCollectionProperties))
    collectionDto: CollectionDto,
  ): Promise<CollectionResponse<any>> {
    return { data: [], pagination: { total: 1, limit: 10, page: 0 } };
  }
}
