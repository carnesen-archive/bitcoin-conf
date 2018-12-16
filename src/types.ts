import { SECTION_OPTIONS, TOP_OPTIONS } from './options';
import { Config } from './r-type';

export type TopConfig = Config<typeof TOP_OPTIONS>;
export type SectionConfig = Config<typeof SECTION_OPTIONS>;

export interface BitcoinConfig {
  top?: TopConfig;
  main?: SectionConfig;
  test?: SectionConfig;
  regtest?: SectionConfig;
}
