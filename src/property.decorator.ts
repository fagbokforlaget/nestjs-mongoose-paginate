export class CollectionProperties {
  __props: Record<string, CollectionPropertyOptions> = {};
}

export interface CollectionPropertyOptions {
  readonly name?: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly default?: boolean;
}

export const Expose = (options?: CollectionPropertyOptions) => {
  return (target: CollectionProperties, propertyName: string) => {
    target.__props = target.__props ?? {};
    const propName = options?.name ?? propertyName;
    const sortable = options?.sortable ?? false;
    const filterable = options?.filterable ?? false;
    const def = options?.default ?? false;

    target.__props[propName] = {
      name: propertyName,
      sortable,
      filterable,
      default: def,
    };
  };
};
