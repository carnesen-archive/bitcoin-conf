import {
  BitcoinConfig,
  TopSection,
  MainSection,
  TestSection,
  RegtestSection,
} from './config';
import { SECTION_NAMES } from './names';

type AnySection = TopSection | MainSection | RegtestSection | TestSection;

// For single-valued options, the first value takes precedence.
// Options with value undefined are not copied into the merged config.
// Arrays are merged with config0 values coming first.
function mergeSections(section0: TopSection, section1: AnySection): TopSection;
function mergeSections<T extends AnySection>(section0: T, section1: T): T;
function mergeSections(section0: AnySection, section1: AnySection) {
  const mergedConfig: AnySection = {};
  const optionNames0 = Object.keys(section0);
  const optionNames1 = Object.keys(section1);
  const uniqueOptionNames = new Set([...optionNames0, ...optionNames1]);
  for (const optionName of uniqueOptionNames) {
    const value0 = (section0 as any)[optionName];
    const value1 = (section1 as any)[optionName];
    if (value0 != null) {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        (mergedConfig as any)[optionName] = [...value0, ...value1];
      } else {
        (mergedConfig as any)[optionName] = value0;
      }
    } else if (value1 != null) {
      (mergedConfig as any)[optionName] = value1;
    }
  }
  return mergedConfig;
}

const mergeBitcoinConfigs = (
  bitcoinConfig0: BitcoinConfig,
  bitcoinConfig1: BitcoinConfig,
) => {
  const mergedBitcoinConfig: BitcoinConfig = {};
  for (const key of SECTION_NAMES) {
    const config0 = bitcoinConfig0[key];
    const config1 = bitcoinConfig1[key];
    if (config0 && config1) {
      mergedBitcoinConfig[key] = mergeSections(config0, config1);
    } else if (config0 || config1) {
      mergedBitcoinConfig[key] = config0 || config1;
    }
  }
  return mergedBitcoinConfig;
};

export { mergeBitcoinConfigs, mergeSections as mergeSectionConfigs };
