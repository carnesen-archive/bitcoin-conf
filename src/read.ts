import { readFileSync, existsSync } from 'fs';
import { BITCOIN_CONF_FILENAME, getDefaultSectionedBitcoinConfig } from './default';
import { parseBitcoinConf } from './parse';
import { mergeBitcoinConfigsWithSections, mergeActiveSectionConfig } from './merge';
import { toAbsolute } from './util';
import { SectionedBitcoinConfig } from './config';
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
  let bitcoinConfig: SectionedBitcoinConfig;
  const confPath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  try {
    bitcoinConfig = readAndParse(confPath);
  } catch (ex) {
    if (ex.code === 'ENOENT' && !conf && existsSync(dirname(confPath))) {
      bitcoinConfig = {};
    } else {
      throw ex;
    }
  }
  const { includeconf } = mergeActiveSectionConfig(bitcoinConfig);
  if (includeconf) {
    for (const includeconfItem of includeconf) {
      const includedConfPath = toAbsolute(includeconfItem, datadir);
      const includedBitcoinConfig = readAndParse(includedConfPath);
      bitcoinConfig = mergeBitcoinConfigsWithSections(
        bitcoinConfig,
        includedBitcoinConfig,
      );
    }
  }
  if (withDefaults) {
    bitcoinConfig = mergeBitcoinConfigsWithSections(
      bitcoinConfig,
      getDefaultSectionedBitcoinConfig(),
    );
  }
  const config = mergeActiveSectionConfig(bitcoinConfig);
  if (config.includeconf !== includeconf) {
    throw new Error(
      "Included conf files are not allowed to have includeconf's themselves",
    );
  }
  return config;
};
