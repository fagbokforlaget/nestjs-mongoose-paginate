import Ajv from 'ajv';
import * as schema from './validation.schema.json';
import { FilterValidationError } from './validation.error';
const ajv = new Ajv({ strict: false });

export class FilterSchemaValidator {
  validate(filter: Record<string, unknown>): boolean {
    const compile = ajv.compile(schema);
    if (compile({ filter })) {
      return true;
    } else {
      throw new FilterValidationError('Filter query is invalid');
    }
  }
}
