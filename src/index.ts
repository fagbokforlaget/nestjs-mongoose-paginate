export { DocumentCollector } from './executor/collector';
export { FilterValidationError } from './filter/validation.error';
export { AggregateDto, CollectionDto } from './input.dto';
export { CollectionResponse, Pagination } from './output.dto';
export { CollectionProperties, CollectionPropertyOptions } from './property';
export { Expose } from './property.decorator';
export { SortValidationError } from './sorter/validation.error';
export { ValidationPipe } from './validation.pipe';

// This empty export ensures that TypeScript emits a .js file for this module
export {};
