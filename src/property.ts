export class CollectionProperties {
  __props: Record<string, CollectionPropertyOptions> = {};
}

export interface CollectionPropertyOptions {
  readonly name?: string;
  readonly sortable?: boolean;
  readonly filterable?: boolean;
  readonly default?: boolean;
}
