import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, Min } from 'class-validator';

export type SortableParameters = Record<string, 'desc' | 'asc'>;
export type FilterableParameters = Record<string, unknown>;

export class CounterDto {
  @ApiPropertyOptional({
    example: '{"name":"Some Name"}',
    description: 'Filter query string (JSON), see documentation for its schema',
    required: false,
    type: String,
  })
  @Transform((v: TransformFnParams) => filterQueryToObject(v.value))
    @IsOptional()

  @IsObject()
  readonly filter?: FilterableParameters;
}

export class CollectionDto {
  @ApiPropertyOptional({
    description: 'Filter query string (JSON), see documentation for its schema',
    example: '{"name":"Some Name"}',
    required: false,
    type: String,
  })
  @Transform((v: TransformFnParams) => filterQueryToObject(v.value))
  @IsOptional()
  @IsObject()
  readonly filter?: FilterableParameters;

  @ApiPropertyOptional({
    description:
      'Only whitelisted properties separated by semicolon; prefix with -/+ for DESC/ASC order',
    example: '-created_at;filename',
    default: 'created_at',

    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  readonly sort?: string;

  readonly sorter?: SortableParameters;

  @Type(() => Number)
  @Min(0)
  @ApiPropertyOptional({
    description: 'Page number',
    example: 0,
    required: false,
  })
  readonly page?: number = 0;

  @Type(() => Number)
  @Min(0)
  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  readonly limit?: number = 10;
}

function filterQueryToObject(v: string): Record<string, unknown> {
  return JSON.parse(v);
}
