import { SectionedBitcoinConfig, SectionConfig, BitcoinConfig, Sections } from './config';
import { SECTION_NAMES, SectionName } from './names';
import { BITCOIN_CONFIG_OPTIONS } from './options';
// Options with value undefined are not copied into the merged config.
// Options with array values are merged together with config0 values coming first.
const mergeSectionConfigs = <
  S0 extends SectionName | null,
  S1 extends SectionName | null
>(
  config0: SectionConfig<S0>,
  config1: SectionConfig<S1>,
) => {
  const mergedConfig: SectionConfig<S0 | S1> = {};
  const optionNames0 = Object.keys(config0);
  const optionNames1 = Object.keys(config1);
  const uniqueOptionNames = new Set([...optionNames0, ...optionNames1]);
  for (const optionName of uniqueOptionNames) {
    const value0 = config0[optionName as keyof typeof config0];
    const value1 = config1[optionName as keyof typeof config1];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        mergedConfig[optionName as keyof typeof mergedConfig] = [...value0, ...value1];
        continue;
      }
      mergedConfig[optionName as keyof typeof mergedConfig] = value0;
      continue;
    }
    if (typeof value1 !== 'undefined') {
      mergedConfig[optionName as keyof typeof mergedConfig] = value1;
    }
  }
  return mergedConfig;
};

const mergeSectionedBitcoinConfigs = (
  sectionedBitcoinConfig0: SectionedBitcoinConfig,
  sectionedBitcoinConfig1: SectionedBitcoinConfig,
) => {
  const { sections: sections0, ...rest0 } = sectionedBitcoinConfig0;
  const { sections: sections1, ...rest1 } = sectionedBitcoinConfig1;
  const mergedSectionedBitcoinConfig: SectionedBitcoinConfig = mergeSectionConfigs(
    rest0,
    rest1,
  );
  if (sections0 && sections1) {
    const mergedSections: Sections = {};
    for (const sectionName of SECTION_NAMES) {
      const sectionConfig0 = sections0[sectionName];
      const sectionConfig1 = sections1[sectionName];
      if (sectionConfig0 && sectionConfig1) {
        mergedSections[sectionName] = mergeSectionConfigs(sectionConfig0, sectionConfig1);
        continue;
      }
      if (sectionConfig0 || sectionConfig1) {
        mergedSections[sectionName] = sectionConfig0 || sectionConfig1;
      }
    }
    mergedSectionedBitcoinConfig.sections = mergedSections;
  } else if (sections0 || sections1) {
    mergedSectionedBitcoinConfig.sections = sections0 || sections1;
  }
  return mergedSectionedBitcoinConfig;
};

const getActiveSectionName = (bitcoinConfig: BitcoinConfig): SectionName => {
  const { regtest, testnet } = bitcoinConfig;
  if (regtest && testnet) {
    throw new Error('regtest and testnet cannot both be set to true');
  }
  if (regtest) {
    return 'regtest';
  }
  if (testnet) {
    return 'test';
  }
  return 'main';
};

export const mergeUpActiveSectionConfig = (
  sectionedBitcoinConfig: SectionedBitcoinConfig,
): BitcoinConfig => {
  const activeSectionName = getActiveSectionName(sectionedBitcoinConfig);
  const { sections, ...rest } = sectionedBitcoinConfig;
  if (activeSectionName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete rest[optionName as keyof typeof BITCOIN_CONFIG_OPTIONS];
      }
    }
  }
  if (!sections) {
    return rest;
  }
  const sectionConfig = sections[activeSectionName];
  if (!sectionConfig) {
    return rest;
  }
  return mergeSectionConfigs(rest, sectionConfig);
};
