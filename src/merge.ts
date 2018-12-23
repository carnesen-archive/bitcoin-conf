import { BitcoinConfig, TopSection, Section } from './config';
import { SECTION_NAMES, NetworkName, SectionName } from './names';
import { BITCOIN_CONFIG_OPTIONS } from './options';

// For single-valued options, the first value takes precedence.
// Options with value undefined are not copied into the merged config.
// Arrays are merged with config0 values coming first.
const mergeSections = <S0 extends SectionName, S1 extends SectionName>(
  section0: Section<S0>,
  section1: Section<S1>,
) => {
  const mergedConfig: Section<S0 | S1> = {};
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
};

export const mergeBitcoinConfigs = (
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

export const mergeNetworkSectionIntoTopSection = (bitcoinConfig: BitcoinConfig) => {
  const topSection: TopSection = bitcoinConfig.top || {};

  let networkName: NetworkName = 'main';
  if (topSection.regtest && topSection.testnet) {
    throw new Error('regtest and testnet cannot both be set to true');
  }
  if (topSection.regtest) {
    networkName = 'regtest';
  } else if (topSection.testnet) {
    networkName = 'test';
  }

  if (networkName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete (topSection as any)[optionName];
      }
    }
  }

  // (erroneously?) does not include undefined in its type
  const networkSection = bitcoinConfig[networkName]!;
  if (!networkSection) {
    return topSection;
  }
  const mergedTopSection: TopSection = mergeSections(topSection, networkSection);
  return mergedTopSection;
};
