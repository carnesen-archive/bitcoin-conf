const STRING = 'STRING';
const BOOLEAN = 'BOOLEAN';
const STRING_ARRAY = 'STRING_ARRAY';
const NUMBER = 'NUMBER';

export const R_TYPE = {
  [STRING]: STRING as typeof STRING,
  [BOOLEAN]: BOOLEAN as typeof BOOLEAN,
  [STRING_ARRAY]: STRING_ARRAY as typeof STRING_ARRAY,
  [NUMBER]: NUMBER as typeof NUMBER,
};

type RType = keyof typeof R_TYPE;
type RValue<R extends RType> = R extends typeof STRING
  ? string
  : R extends typeof BOOLEAN
    ? boolean
    : R extends typeof NUMBER ? number : R extends typeof STRING_ARRAY ? string[] : never;

function castToRValue(rType: 'STRING'): (str: string) => string;
function castToRValue(rType: 'STRING_ARRAY'): (str: string) => string[];
function castToRValue(rType: 'NUMBER'): (str: string) => number;
function castToRValue(rType: 'BOOLEAN'): (str: string) => boolean;
function castToRValue<R extends RType>(rType: R): (str: string) => RValue<R>;
function castToRValue(rType: RType) {
  return (str: string) => {
    switch (rType) {
      case 'STRING': {
        const rValue: RValue<'STRING'> = str;
        return rValue;
      }
      case 'STRING_ARRAY': {
        const rValue: RValue<'STRING_ARRAY'> = [str];
        return rValue;
      }
      case 'BOOLEAN': {
        const rValue: RValue<'BOOLEAN'> = str === '1';
        return rValue;
      }
      case 'NUMBER': {
        const rValue: RValue<'NUMBER'> = Number(str);
        return rValue;
      }
      default:
        throw new Error(`Unknown runtime type ${rType}`);
    }
  };
}
export { castToRValue };

export type RTypeMap = {
  [key: string]: RType;
};

export const getRType = (rTypeMap: RTypeMap) => (key: string) => {
  const rType = rTypeMap[key];
  if (!rType) {
    throw new Error(`Unknown key "${key}"`);
  }
  return rType;
};

export type Config<M extends RTypeMap = RTypeMap> = { [K in keyof M]?: RValue<M[K]> };

// Note: for single-valued options, the first value takes precedence
export const mergeConfigs = <M extends RTypeMap>(
  config0: Config<M>,
  config1: Config<M>,
) => {
  const keys0 = Object.keys(config0);
  const keys1 = Object.keys(config1);
  const obj: Config<M> = {};
  const keys = new Set([...keys0, ...keys1]);
  for (const key of keys) {
    const value0 = config0[key];
    const value1 = config1[key];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        (obj as any)[key] = [...value0, ...value1];
      } else {
        obj[key] = value0;
      }
    } else {
      obj[key] = value1;
    }
  }
  return obj;
};

export const pruneConfig = (config: Config, rTypeMap: RTypeMap) => {
  const prunedConfig: Config<typeof rTypeMap> = {};
  const keys = Object.keys(rTypeMap);
  for (const key of keys) {
    if (typeof config[key] !== 'undefined') {
      prunedConfig[key] = config[key];
    }
  }
  return prunedConfig;
};
