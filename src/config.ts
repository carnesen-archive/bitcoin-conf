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

export type Section<S extends SectionName> = Partial<
  { [K in OptionName<S>]: Value<Options[K]['typeName']> }
>;

export interface TopSection extends Section<'top'> {}
export interface MainSection extends Section<'main'> {}
export interface RegtestSection extends Section<'regtest'> {}
export interface TestSection extends Section<'test'> {}

export interface BitcoinConfig {
  top?: TopSection;
  main?: MainSection;
  regtest?: RegtestSection;
  test?: TestSection;
}
