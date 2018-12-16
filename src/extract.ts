import { BitcoinConfig, SectionConfig, TopConfig } from './types';
import { MAIN_ONLY_OPTIONS, SECTION_OPTIONS } from './options';
import { pruneConfig, mergeConfigs } from './r-type';
import { SectionName } from './names';
import { mergeBitcoinConfigs } from './merge';
import { getDefaultBitcoinConfig } from './default';

const extractConfigByName = (
  bitcoinConfig: BitcoinConfig,
  sectionName: SectionName,
): SectionConfig => {
  const sectionConfig = bitcoinConfig[sectionName];
  if (bitcoinConfig.top) {
    const prunedTopConfig = pruneConfig(bitcoinConfig.top || {}, SECTION_OPTIONS);
    if (sectionName !== 'main') {
      for (const key of Object.keys(MAIN_ONLY_OPTIONS)) {
        delete prunedTopConfig[key as keyof typeof MAIN_ONLY_OPTIONS];
      }
    }
    if (sectionConfig) {
      return mergeConfigs(prunedTopConfig, sectionConfig);
    }
    return prunedTopConfig;
  }
  if (sectionConfig) {
    return sectionConfig;
  }
  return {};
};

export const extractEffectiveConfig = (bitcoinConfig: BitcoinConfig) => {
  const defaultBitcoinConfig = getDefaultBitcoinConfig();
  const effectiveBitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, defaultBitcoinConfig);
  let sectionName: SectionName = 'main';
  if (effectiveBitcoinConfig.top) {
    if (effectiveBitcoinConfig.top.regtest && effectiveBitcoinConfig.top.testnet) {
      throw new Error('regtest and testnet cannot both be set to true');
    }
    if (effectiveBitcoinConfig.top.regtest) {
      sectionName = 'regtest';
    } else if (effectiveBitcoinConfig.top.testnet) {
      sectionName = 'test';
    }
  }
  const effectiveConfig: TopConfig = extractConfigByName(
    effectiveBitcoinConfig,
    sectionName,
  );
  return effectiveConfig;
};
