export interface Kalas {
  _id: string;
  title: string;
  name: string;
  data: Data;
  code: string;
}

export interface Data {
  schema: Schema;
}

export interface Schema {
  title: string;
  type: string;
  required: string[];
  properties: Properties;
}

export interface Properties {
  [key: string]: BaseProperty | EnumProperty | ArrayEnumProperty;
}

export interface BaseProperty {
  title: string;
  type: string;
}

export interface EnumOption {
  const: string | number;
  title: string;
  type: string;
}

export interface EnumProperty extends BaseProperty {
  oneOf: EnumOption[];
}

export interface ArrayEnumProperty extends BaseProperty {
  uniqueItems: boolean;
  items: {
    type: string;
    anyOf: EnumOption[];
  };
}

export interface Property {
  title: string;
  type: string;
}
