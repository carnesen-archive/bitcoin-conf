import { join } from 'path';
import { platform, homedir } from 'os';
import { SectionedBitcoinConfig, Sections, BitcoinConfig } from './config';
import { BITCOIN_CONFIG_OPTIONS } from './options';
import { SECTION_NAMES } from './names';

export const BITCOIN_CONF_FILENAME = 'bitcoin.conf';

export function getDefaultDatadir(p = platform()) {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      return join(process.env.APPDATA!, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
}

type OptionName = keyof typeof BITCOIN_CONFIG_OPTIONS;

export function getDefaults(p = platform()) {
  const bitcoinConfig: BitcoinConfig = {
    datadir: getDefaultDatadir(p),
  };
  const sections: Required<Sections> = {
    main: {},
    regtest: {},
    test: {},
  };
  for (const [optionName, option] of Object.entries(BITCOIN_CONFIG_OPTIONS)) {
    const { defaultValue } = option;
    if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
      for (const sectionName of SECTION_NAMES) {
        sections[sectionName][optionName as OptionName] = defaultValue[sectionName];
      }
    } else {
      bitcoinConfig[optionName as OptionName] = defaultValue;
    }
  }
  return { ...bitcoinConfig, sections };
}
