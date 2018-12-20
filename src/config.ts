import { OPTIONS } from './options';
import { Option, OptionValue } from './option';

export type MainOptionName = {
  [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K] extends
    | Option<any, true, any>
    | Option<any, any, true>
    ? never
    : K
}[keyof typeof OPTIONS];

export type TestOptionName = {
  [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K] extends Option<any, any, true>
    ? never
    : K
}[keyof typeof OPTIONS];

export type SectionConfig<T extends keyof typeof OPTIONS> = {
  [K in T]?: OptionValue<typeof OPTIONS[K]['typeName']>
};

export interface TopConfig extends SectionConfig<keyof typeof OPTIONS> {}
interface MainConfig extends SectionConfig<MainOptionName> {}
interface TestConfig extends SectionConfig<TestOptionName> {}

export interface BitcoinConfig {
  top?: TopConfig;
  main?: MainConfig;
  test?: TestConfig;
  regtest?: TestConfig;
}

export const SECTION_NAMES: SectionName[] = ['main', 'regtest', 'test'];
export const BITCOIN_CONFIG_KEYS: (BitcoinConfigKey)[] = ['top', ...SECTION_NAMES];

export type SectionName = Exclude<keyof BitcoinConfig, 'top'>;
export type BitcoinConfigKey = keyof BitcoinConfig;

const createCastToName = <N extends string>(names: N[]) => (str: string) => {
  const name = str as N;
  if (!names.includes(name)) {
    throw new Error(`Expected key to be one of ${names}`);
  }
  return name;
};

export const castToSectionName = createCastToName(SECTION_NAMES);
export const castToBitcoinConfigKey = createCastToName(BITCOIN_CONFIG_KEYS);
