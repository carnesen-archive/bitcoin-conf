import { SectionConfig, BitcoinConfig, castToBitcoinConfigKey } from './config';
import { OPTIONS } from './options';

// Note: for single-valued options, the first value takes precedence
export const mergeConfigs = <T extends keyof typeof OPTIONS>(
  config0: SectionConfig<T>,
  config1: SectionConfig<T>,
) => {
  const keys0 = Object.keys(config0) as T[];
  const keys1 = Object.keys(config1) as T[];
  const obj: SectionConfig<T> = {};
  const keys = new Set([...keys0, ...keys1]);
  for (const key of keys) {
    const value0 = config0[key];
    const value1 = config1[key];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        (obj as any)[key] = [...value0, ...value1];
      } else {
        (obj as any)[key] = value0;
      }
    } else {
      obj[key] = value1;
    }
  }
  return obj;
};

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
