import { EOL } from 'os';

export type TypeName = 'string' | 'string[]' | 'boolean' | 'number';
export type OptionValue<T extends TypeName> = T extends 'string'
  ? string
  : T extends 'boolean'
    ? boolean
    : T extends 'number' ? number : T extends 'string[]' ? string[] : never;

export type Option<
  T extends TypeName = TypeName,
  NotAllowedInMain extends boolean = boolean,
  OnlyAllowedInTop extends boolean = boolean
> = {
  typeName: T;
  longName: string;
  description: string | string[];
  defaultValue?:
    | OptionValue<T>
    | {
        main: OptionValue<T>;
        test: OptionValue<T>;
        regtest: OptionValue<T>;
      };
  notAllowedInMain?: NotAllowedInMain;
  onlyAppliesToMain?: boolean;
  onlyAllowedInTop?: OnlyAllowedInTop;
};

export const createOption = <
  T extends TypeName,
  NotAllowedInMain extends boolean,
  OnlyAllowedInTop extends boolean
>(
  option: Option<T, NotAllowedInMain, OnlyAllowedInTop>,
) => option;

export { castTo };
function castTo(typeName: 'string'): (str: string) => string;
function castTo(typeName: 'string[]'): (str: string) => string[];
function castTo(typeName: 'number'): (str: string) => number;
function castTo(typeName: 'boolean'): (str: string) => boolean;
function castTo<T extends TypeName>(typeName: T): (str: string) => OptionValue<T>;
function castTo(typeName: TypeName) {
  return (str: string) => {
    switch (typeName) {
      case 'string': {
        const value: OptionValue<'string'> = str;
        return value;
      }
      case 'string[]': {
        const value: OptionValue<'string[]'> = [str];
        return value;
      }
      case 'boolean': {
        const value: OptionValue<'boolean'> = str === '1';
        return value;
      }
      case 'number': {
        const value: OptionValue<'number'> = Number(str);
        return value;
      }
      default:
        throw new Error(`Unknown type name ${typeName}`);
    }
  };
}

export const serialize = (optionName: string, optionValue: OptionValue<TypeName>) => {
  if (Array.isArray(optionValue)) {
    return optionValue
      .map(optionValueItem => `${optionName}=${optionValueItem}`)
      .join(EOL);
  }
  if (optionValue === true) {
    return `${optionName}=1`;
  }
  if (optionValue === false) {
    return `${optionName}=0`;
  }
  return `${optionName}=${optionValue}`;
};
