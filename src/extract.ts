import { BitcoinConfig, TopConfig } from './config';
import { mergeBitcoinConfigs, mergeSectionConfigs } from './merge';
import { getDefaultBitcoinConfig } from './default';
import { OPTIONS } from './constants';

export const extractEffectiveTopConfig = (passedBitcoinConfig: BitcoinConfig) => {
  const bitcoinConfig = mergeBitcoinConfigs(
    passedBitcoinConfig,
    getDefaultBitcoinConfig(),
  );
  const topConfig: TopConfig = bitcoinConfig.top!;
  let sectionName: keyof BitcoinConfig = 'main';
  if (topConfig) {
    if (topConfig.regtest && topConfig.testnet) {
      throw new Error('regtest and testnet cannot both be set to true');
    }
    if (topConfig.regtest) {
      sectionName = 'regtest';
    } else if (topConfig.testnet) {
      sectionName = 'test';
    }
  }

  if (sectionName !== 'main') {
    for (const [optionName, option] of Object.entries(OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete (topConfig as any)[optionName];
      }
    }
  }

  const sectionConfig = bitcoinConfig[sectionName]!;

  const effectiveTopConfig = mergeSectionConfigs(topConfig, sectionConfig);
  return effectiveTopConfig;
};
