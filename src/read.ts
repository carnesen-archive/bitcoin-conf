import { readFileSync } from 'fs';
import { BITCOIN_CONF_FILENAME, getDefaultBitcoinConfig } from './default';
import { parseBitcoinConf } from './parse';
import { extractEffectiveTopSection } from './extract';
import { mergeBitcoinConfigs } from './merge';
import { toAbsolute } from './util';

const readOneConfigFile = (conf: string, datadir?: string) => {
  const confPath = toAbsolute(conf, datadir);
  const fileContents = readFileSync(confPath, { encoding: 'utf8' });
  return parseBitcoinConf(fileContents);
};

type Options = Partial<{ conf: string; datadir: string; withDefaults: boolean }>;

export const readConfigFiles = (options: Options = {}) => {
  const { conf, datadir, withDefaults } = options;
  let bitcoinConfig = readOneConfigFile(conf || BITCOIN_CONF_FILENAME, datadir);
  // We need to extract the effective config here to know which includeconf's to read
  const config0 = extractEffectiveTopSection(bitcoinConfig);
  const { includeconf } = config0;
  if (includeconf) {
    for (const includedConf of includeconf) {
      const includedBitcoinConfig = readOneConfigFile(includedConf, datadir);
      bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, includedBitcoinConfig);
    }
  }
  if (withDefaults) {
    bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, getDefaultBitcoinConfig());
  }
  const config = extractEffectiveTopSection(bitcoinConfig);
  return config;
};
