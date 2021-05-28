/* eslint-disable @typescript-eslint/no-unused-vars */
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { SorterParser } from './sorter/parser';
import { FilterParser } from './filter/parser';
import { CollectionDto } from './input.dto';
import { CollectionProperties } from './property';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private propsClass: typeof CollectionProperties) {}

  transform(value: CollectionDto, _metadata: ArgumentMetadata) {
    const filterParams = new FilterParser(this.propsClass).parse(value);
    const sorterParams = new SorterParser(this.propsClass).parse(value.sort);
    const { sort: _, ...rest } = value;

    return { ...rest, filter: filterParams, sorter: sorterParams };
  }
}
