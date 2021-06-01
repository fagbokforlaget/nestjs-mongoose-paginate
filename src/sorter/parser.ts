import { isNotEmpty } from 'class-validator';
import { CollectionProperties } from '../property';
import { SortableParameters } from '../input.dto';
import { SortValidationError } from './validation.error';

export class SorterParser {
  #orderMap = {
    '+': 'asc',
    '-': 'desc',
  };

  constructor(private collectionPropsClass: typeof CollectionProperties) {}

  parse(sortProp?: string): SortableParameters {
    const sortableParameters: SortableParameters = {};
    const props = sortProp !== undefined ? sortProp.split(';') : [];

    props
      .filter((v) => isNotEmpty(v))
      .forEach((name: string) => {
        const [propertyName, order] = ['-', '+'].includes(name[0])
          ? [name.slice(1), this.#orderMap[name[0]]]
          : [name, 'asc'];

        sortableParameters[this.validateProperty(propertyName)] = order;
      });

    if (Object.keys(sortableParameters).length === 0 && this.defaultSort) {
      sortableParameters[this.defaultSort] = 'asc';
    }

    return sortableParameters;
  }

  private get defaultSort(): string {
    const props = this.collectionPropsClass.prototype.__props;
    return Object.keys(props).filter((key) => props[key].default)[0];
  }

  private validateProperty(prop: string) {
    if (
      !Object.keys(this.collectionPropsClass.prototype.__props).includes(prop)
    )
      throw new SortValidationError(
        `Property '${prop}' is not allowed for sorting.`,
      );

    return this.collectionPropsClass.prototype.__props[prop]?.name ?? prop;
  }
}
