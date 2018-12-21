import { BitcoinConfig } from './config';
import { toAbsolute, findOption, castToSectionName } from './util';
import { BITCOIN_CONF_FILENAME } from './default';
const pkg = require('../package.json');

function writeConfFile(
  bitcoinConfig: BitcoinConfig,
  options: { conf?: string; datadir?: string },
) {
  const { conf, datadir } = options;
  let fileContents = '';
  const comment = (x: string | string[]) => {
    if (typeof x === 'string') {
      fileContents += `# ${x}`;
    } else {
      for (const str of x) {
        fileContents += `# ${str}`;
      }
    }
  };

  comment(`This file was written by ${writeConfFile.name} in ${pkg.name}`);
  const topConfig = bitcoinConfig.top;
  for (const [bitcoinConfigKey, sectionConfig] of Object.entries(bitcoinConfig)) {
    if (bitcoinConfigKey !== 'top') {
      const sectionName = castToSectionName(bitcoinConfigKey);
      fileContents += `\n[${sectionName}]`;
    }
    for (const [optionName, optionValue] of Object.entries(sectionConfig)) {
      const option = findOption(optionName)
      if (Array.isArray(optionValue)) {
        for (const item of optionValue) {
          fileContents += 
        }
      }
    }
  }

  const filePath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
}

export { writeConfFile };
