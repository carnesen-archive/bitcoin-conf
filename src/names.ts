import { BitcoinConfig } from './types';

export const SECTION_NAMES: SectionName[] = ['main', 'test', 'regtest'];
export const BITCOIN_CONFIG_KEYS: (BitcoinConfigKey)[] = ['top', ...SECTION_NAMES];

export type SectionName = Exclude<keyof BitcoinConfig, 'top'>;
export type BitcoinConfigKey = keyof BitcoinConfig;

const createCastToName = <N extends string>(names: N[]) => (str: string) => {
  const name = str as N;
  if (!names.includes(name)) {
    throw new Error(`Expected key to be one of ${names}`);
  }
  return name;
};

export const castToSectionName = createCastToName(SECTION_NAMES);
export const castToBitcoinConfigKey = createCastToName(BITCOIN_CONFIG_KEYS);
