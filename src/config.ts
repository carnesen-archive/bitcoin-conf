import { OPTIONS } from './constants';
import { Option, OptionValue } from './option';

type MainOptionName = {
  [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K] extends
    | Option<any, true, any>
    | Option<any, any, true>
    ? never
    : K
}[keyof typeof OPTIONS];

type TestOptionName = {
  [K in keyof typeof OPTIONS]: (typeof OPTIONS)[K] extends Option<any, any, true>
    ? never
    : K
}[keyof typeof OPTIONS];

export type SectionConfig<T extends keyof typeof OPTIONS> = {
  [K in T]?: OptionValue<typeof OPTIONS[K]['typeName']>
};

export interface TopConfig extends SectionConfig<keyof typeof OPTIONS> {}
export interface MainConfig extends SectionConfig<MainOptionName> {}
export interface TestConfig extends SectionConfig<TestOptionName> {}

export interface BitcoinConfig {
  top?: TopConfig;
  main?: MainConfig;
  test?: TestConfig;
  regtest?: TestConfig;
}
