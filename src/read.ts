import { isAbsolute, join } from 'path';
import { readFileSync } from 'fs';
import { getDefaultDatadir, BITCOIN_CONF_FILENAME } from './default';
import { parseBitcoinConf } from './parse';
import { extractEffectiveConfig } from './extract';
import { mergeBitcoinConfigs } from './merge';
import { BitcoinConfig } from './types';

const toAbsolute = (filePath: string, datadir?: string) => {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error('Path "datadir" must be absolute');
  }
  return join(datadir || getDefaultDatadir(), filePath);
};

const readAndParseConfFile = (conf: string, datadir?: string) => {
  const confPath = toAbsolute(conf, datadir);
  const fileContents = readFileSync(confPath, { encoding: 'utf8' });
  return parseBitcoinConf(fileContents);
};

export const readConfFiles = (options: { conf?: string; datadir?: string } = {}) => {
  const { conf, datadir } = options;
  let bitcoinConfig = readAndParseConfFile(conf || BITCOIN_CONF_FILENAME, datadir);
  bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, {
    top: {
      datadir,
    },
  });
  const config0 = extractEffectiveConfig(bitcoinConfig);
  const { includefile } = config0;
  if (includefile) {
    for (const includedConf of includefile) {
      const includedBitcoinConfig = readAndParseConfFile(includedConf, datadir);
      bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, includedBitcoinConfig);
    }
  }
  const config = extractEffectiveConfig(bitcoinConfig);
  return config;
};
