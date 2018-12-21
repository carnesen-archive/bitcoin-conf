import { BITCOIN_CONFIG_OPTIONS } from './constants';
import { Option, OptionValue } from './option';

type MainOptionName = {
  [K in keyof typeof BITCOIN_CONFIG_OPTIONS]: (typeof BITCOIN_CONFIG_OPTIONS)[K] extends
    | Option<any, true, any>
    | Option<any, any, true>
    ? never
    : K
}[keyof typeof BITCOIN_CONFIG_OPTIONS];

type TestOptionName = {
  [K in keyof typeof BITCOIN_CONFIG_OPTIONS]: (typeof BITCOIN_CONFIG_OPTIONS)[K] extends Option<
    any,
    any,
    true
  >
    ? never
    : K
}[keyof typeof BITCOIN_CONFIG_OPTIONS];

export type SectionConfig<T extends keyof typeof BITCOIN_CONFIG_OPTIONS> = {
  [K in T]?: OptionValue<typeof BITCOIN_CONFIG_OPTIONS[K]['typeName']>
};

export interface TopConfig extends SectionConfig<keyof typeof BITCOIN_CONFIG_OPTIONS> {}
export interface MainConfig extends SectionConfig<MainOptionName> {}
export interface TestConfig extends SectionConfig<TestOptionName> {}

export interface BitcoinConfig {
  top?: TopConfig;
  main?: MainConfig;
  test?: TestConfig;
  regtest?: TestConfig;
}
