import { BITCOIN_CONFIG_OPTIONS, Value } from './options';
import { SectionName } from './names';

type Options = typeof BITCOIN_CONFIG_OPTIONS;

type OptionName<S extends SectionName> = {
  [OptionName in keyof Options]: (Options)[OptionName]['notAllowedIn'] extends {
    [T in S]: true
  }
    ? never
    : OptionName
}[keyof Options];

export type SectionConfig<S extends SectionName> = Partial<
  { [K in OptionName<S>]: Value<Options[K]['typeName']> }
>;

export interface TopSectionConfig extends SectionConfig<'top'> {}
export interface MainSectionConfig extends SectionConfig<'main'> {}
export interface RegtestSectionConfig extends SectionConfig<'regtest'> {}
export interface TestSectionConfig extends SectionConfig<'test'> {}

export interface BitcoinConfig {
  top?: TopSectionConfig;
  main?: MainSectionConfig;
  regtest?: RegtestSectionConfig;
  test?: TestSectionConfig;
}
