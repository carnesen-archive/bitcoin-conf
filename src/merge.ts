import { BitcoinConfig } from './types';
import { mergeConfigs } from './r-type';
import { castToBitcoinConfigKey } from './names';

export const mergeBitcoinConfigs = (
  bitcoinConfig0: BitcoinConfig,
  bitcoinConfig1: BitcoinConfig,
) => {
  const config: BitcoinConfig = {};
  const keys0 = Object.keys(bitcoinConfig0);
  const keys1 = Object.keys(bitcoinConfig1);
  const keys = new Set([...keys0, ...keys1].map(castToBitcoinConfigKey));
  for (const key of keys) {
    const config0 = bitcoinConfig0[key];
    const config1 = bitcoinConfig1[key];
    if (config0 && config1) {
      config[key] = mergeConfigs(config0, config1);
    } else if (config0 || config1) {
      config[key] = config0 || config1;
    }
  }
  return config;
};
