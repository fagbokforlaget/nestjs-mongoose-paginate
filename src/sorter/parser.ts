import { isNotEmpty } from 'class-validator';
import { SortableParameters } from '../input.dto';
import { CollectionProperties } from '../property';
import { SortValidationError } from './validation.error';

export class SorterParser {
  constructor(private collectionPropsClass: typeof CollectionProperties) {}

  parse(sortProp?: string): SortableParameters {
    const sortableParameters: SortableParameters = {};
    const props = sortProp !== undefined ? sortProp.split(';') : [];
    props
      .filter((v) => isNotEmpty(v))
      .forEach((name: string) => {
        const desc = name[0] === '-' ? true : false;
        const asc = name[0] === '+' ? true : false;
        const prop = desc || asc ? name.slice(1) : name;

        sortableParameters[this.validateProperty(prop)] = desc ? 'desc' : 'asc';
      });

    if (Object.keys(sortableParameters).length === 0) {
      sortableParameters[this.defaultSort] = 'asc';
    }

    return sortableParameters;
  }

  private get defaultSort(): string {
    const props = this.collectionPropsClass.prototype.__props;
    const key = Object.keys(props).filter((key) => props[key].default)[0];

    return key ? props[key].name : 'created_at';
  }

  private validateProperty(prop: string) {
    if (
      !Object.keys(this.collectionPropsClass.prototype.__props).includes(
        prop,
      ) ||
      !this.collectionPropsClass.prototype.__props[prop]?.sortable
    )
      throw new SortValidationError(
        `Property '${prop}' is not allowed for sorting.`,
      );

    return this.collectionPropsClass.prototype.__props[prop]?.name ?? prop;
  }
}
