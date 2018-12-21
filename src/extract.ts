import { BitcoinConfig, TopConfig } from './config';
import { mergeBitcoinConfigs, mergeSectionConfigs } from './merge';
import { getDefaultBitcoinConfig } from './default';
import { BITCOIN_CONFIG_OPTIONS } from './constants';

type Options = Partial<{ withDefaults: boolean }>;

export const extractEffectiveTopConfig = (
  passedBitcoinConfig: BitcoinConfig,
  options: Options = {},
) => {
  let bitcoinConfig = passedBitcoinConfig;
  if (options.withDefaults) {
    bitcoinConfig = mergeBitcoinConfigs(passedBitcoinConfig, getDefaultBitcoinConfig());
  }
  const topConfig: TopConfig = bitcoinConfig.top || {};
  let sectionName: keyof BitcoinConfig = 'main';
  if (topConfig.regtest && topConfig.testnet) {
    throw new Error('regtest and testnet cannot both be set to true');
  }
  if (topConfig.regtest) {
    sectionName = 'regtest';
  } else if (topConfig.testnet) {
    sectionName = 'test';
  }

  if (sectionName !== 'main') {
    for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
      if (option.onlyAppliesToMain) {
        delete (topConfig as any)[optionName];
      }
    }
  }

  // sectionConfig here erroneously (?) does not include undefined in its type
  const sectionConfig = bitcoinConfig[sectionName]!;
  if (!sectionConfig) {
    return topConfig;
  }
  const effectiveTopConfig = mergeSectionConfigs(topConfig, sectionConfig);
  return effectiveTopConfig;
};
