import { readFileSync } from 'fs';
import { BITCOIN_CONF_FILENAME } from './default';
import { parseBitcoinConf } from './parse';
import { extractEffectiveTopConfig } from './extract';
import { mergeBitcoinConfigs } from './merge';
import { toAbsolute } from './util';

const readAndParseConfFile = (conf: string, datadir?: string) => {
  const confPath = toAbsolute(conf, datadir);
  const fileContents = readFileSync(confPath, { encoding: 'utf8' });
  return parseBitcoinConf(fileContents);
};

type Options = Partial<{ conf: string; datadir: string; withDefaults: boolean }>;

export const readConfFiles = (options: Options = {}) => {
  const { conf, datadir, withDefaults } = options;
  let bitcoinConfig = readAndParseConfFile(conf || BITCOIN_CONF_FILENAME, datadir);

  // We need to extract the effective config here to know which includefiles to read
  const config0 = extractEffectiveTopConfig(bitcoinConfig);
  const { includeconf } = config0;
  if (includeconf) {
    for (const includedConf of includeconf) {
      const includedBitcoinConfig = readAndParseConfFile(includedConf, datadir);
      bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, includedBitcoinConfig);
    }
  }
  const config = extractEffectiveTopConfig(bitcoinConfig, { withDefaults });
  return config;
};
