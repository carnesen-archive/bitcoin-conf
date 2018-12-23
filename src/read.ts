import { readFileSync, existsSync } from 'fs';
import { BITCOIN_CONF_FILENAME, getDefaultBitcoinConfig } from './default';
import { parseBitcoinConf } from './parse';
import { mergeBitcoinConfigs, mergeNetworkSectionIntoTopSection } from './merge';
import { toAbsolute } from './util';
import { BitcoinConfig } from './config';
import { dirname } from 'path';

const readAndParse = (confPath: string) => {
  const fileContents = readFileSync(confPath, { encoding: 'utf8' });
  return parseBitcoinConf(fileContents);
};

type ReadConfigFilesOptions = Partial<{
  conf: string;
  datadir: string;
  withDefaults: boolean;
}>;

export const readConfigFiles = (options: ReadConfigFilesOptions = {}) => {
  const { conf, datadir, withDefaults } = options;
  let bitcoinConfig: BitcoinConfig;
  const confPath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  try {
    bitcoinConfig = readAndParse(confPath);
  } catch (ex) {
    if (ex.code === 'ENOENT' && !conf && existsSync(dirname(confPath))) {
      throw ex;
    }
    bitcoinConfig = {};
  }
  const { includeconf } = mergeNetworkSectionIntoTopSection(bitcoinConfig);
  if (includeconf) {
    for (const includeconfItem of includeconf) {
      const includedConfPath = toAbsolute(includeconfItem, datadir);
      const includedBitcoinConfig = readAndParse(includedConfPath);
      bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, includedBitcoinConfig);
    }
  }
  if (withDefaults) {
    bitcoinConfig = mergeBitcoinConfigs(bitcoinConfig, getDefaultBitcoinConfig());
  }
  const config = mergeNetworkSectionIntoTopSection(bitcoinConfig);
  return config;
};
