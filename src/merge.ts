import { BitcoinConfig, TopConfig, MainConfig, TestConfig } from './config';
import { BITCOIN_CONFIG_KEYS } from './constants';

type AnySectionConfig = TopConfig | MainConfig | TestConfig;

// For single-valued options, the first value takes precedence.
// Options with value undefined are not copied into the merged config.
// Arrays are merged with config0 values coming first.

function mergeSectionConfigs(
  sectionConfig0: TopConfig,
  sectionConfig1: AnySectionConfig,
): TopConfig;
function mergeSectionConfigs<T extends AnySectionConfig>(
  sectionConfig0: T,
  sectionConfig1: T,
): T;
function mergeSectionConfigs(
  sectionConfig0: AnySectionConfig,
  sectionConfig1: AnySectionConfig,
) {
  const mergedSectionConfig: AnySectionConfig = {};
  const optionNames0 = Object.keys(sectionConfig0);
  const optionNames1 = Object.keys(sectionConfig1);
  const uniqueOptionNames = new Set([...optionNames0, ...optionNames1]);
  for (const optionName of uniqueOptionNames) {
    const value0 = (sectionConfig0 as any)[optionName];
    const value1 = (sectionConfig1 as any)[optionName];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        (mergedSectionConfig as any)[optionName] = [...value0, ...value1];
      } else {
        (mergedSectionConfig as any)[optionName] = value0;
      }
    } else if (typeof value1 !== 'undefined') {
      (mergedSectionConfig as any)[optionName] = value1;
    }
  }
  return mergedSectionConfig;
}

function mergeBitcoinConfigs(
  bitcoinConfig0: BitcoinConfig,
  bitcoinConfig1: BitcoinConfig,
) {
  const mergedBitcoinConfig: BitcoinConfig = {};
  for (const key of BITCOIN_CONFIG_KEYS) {
    const config0 = bitcoinConfig0[key];
    const config1 = bitcoinConfig1[key];
    if (config0 && config1) {
      mergedBitcoinConfig[key] = mergeSectionConfigs(config0, config1);
    } else if (config0 || config1) {
      mergedBitcoinConfig[key] = config0 || config1;
    }
  }
  return mergedBitcoinConfig;
}

export { mergeBitcoinConfigs, mergeSectionConfigs };
