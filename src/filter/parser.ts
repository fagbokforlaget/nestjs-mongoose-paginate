import { CollectionProperties } from '../property';
import { CollectionDto, FilterableParameters } from '../input.dto';
import { FilterValidationError } from './validation.error';
import { FilterSchemaValidator } from './validator';

const allowedKeys = [
  '$eq',
  '$gt',
  '$gte',
  '$in',
  '$lt',
  '$lte',
  '$ne',
  '$nin',
  '$and',
  '$not',
  '$nor',
  '$or',
  '$regex',
];

export class FilterParser {
  constructor(private collectionPropsClass: typeof CollectionProperties) {}

  parse(filter: CollectionDto): FilterableParameters {
    const fltr = this.transform(filter.filter);

    if (fltr === undefined || fltr === null || Object.keys(fltr).length === 0) {
      return {};
    }

    const validator = new FilterSchemaValidator().validate(fltr);
    if (validator) {
      return fltr;
    }
  }

  private transform(v: string | FilterableParameters) {
    if (v instanceof Array) {
      for (const k of v) {
        this.transform(k);
      }
    } else if (v instanceof Object) {
      for (const key in v) {
        if (/^\$/.test(key)) {
          this.validateAllowedKey(key, v[key]);
        } else {
          const prop = this.validateProperty(key, v[key]);
          if (prop !== key) {
            v[prop] = v[key];
            delete v[key];
          }
        }
      }
      return v;
    }
  }

  private validateProperty(prop: string, value: any) {
    if (
      !Object.keys(this.collectionPropsClass.prototype.__props).includes(prop)
    )
      throw new FilterValidationError(
        `Property '${prop}' is not exposed for filtering.`,
      );

    this.transform(value);

    return this.collectionPropsClass.prototype.__props[prop]?.name ?? prop;
  }

  private validateAllowedKey(key: string, value: any) {
    if (!allowedKeys.includes(key))
      throw new FilterValidationError(
        `Key '${key}' is not allowed for filtering.`,
      );

    this.transform(value);
  }
}
