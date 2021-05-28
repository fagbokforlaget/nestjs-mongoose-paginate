import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDataDto {
  @ApiProperty({}) readonly total: number;
  @ApiProperty({}) readonly page: number;
  @ApiProperty({}) readonly limit: number;
  @ApiPropertyOptional({}) readonly next?: number;
  @ApiPropertyOptional({}) readonly prev?: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  next?: number;
  prev?: number;
}

export interface CollectionResponse<T> {
  readonly data: T[];
  readonly pagination: Pagination;
}
