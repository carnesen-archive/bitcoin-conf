import { BitcoinConfig, TopSection } from './config';
import { mergeSectionConfigs as mergeSections } from './merge';
import { BITCOIN_CONFIG_OPTIONS } from './options';
import { NetworkName } from './names';

export const extractEffectiveTopSection = (bitcoinConfig: BitcoinConfig) => {
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
  const effectiveTopSection = mergeSections(topSection, networkSection);
  return effectiveTopSection;
};
