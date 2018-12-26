import { writeFileSync, existsSync, renameSync } from 'fs';
import { EOL } from 'os';

import { SectionedBitcoinConfig } from './config';
import { toAbsolute, findOption } from './util';
import { BITCOIN_CONF_FILENAME } from './default';
import { Value } from './options';
import { SECTION_NAMES, TypeName } from './names';
const pkg = require('../package.json');

const serializeOption = (optionName: string, optionValue: Value<TypeName>) => {
  if (Array.isArray(optionValue)) {
    return optionValue
      .map(optionValueItem => `${optionName}=${optionValueItem}`)
      .join(EOL);
  }
  if (optionValue === true) {
    return `${optionName}=1`;
  }
  if (optionValue === false) {
    return `${optionName}=0`;
  }
  return `${optionName}=${optionValue}`;
};

const serializeBitcoinConfig = (bitcoinConfig: SectionedBitcoinConfig) => {
  let serialized = '';

  const addLine = (...lines: string[]) => {
    serialized += `${EOL}${lines.join(EOL)}`;
  };

  const addComment = (...comments: string[]) => {
    addLine(...comments.map(comment => `# ${comment}`));
  };

  addComment(`${new Date()}: This file was written by ${pkg.name}`);
  addLine();

  for (const sectionName of SECTION_NAMES) {
    const sectionConfig = bitcoinConfig[sectionName];
    if (!sectionConfig) {
      continue;
    }
    if (sectionName !== 'top') {
      addLine(`[${sectionName}]`);
      addLine();
    }
    for (const [optionName, optionValue] of Object.entries(sectionConfig)) {
      const { option } = findOption(optionName);
      addComment(...option.description);
      if (optionValue != null) {
        addLine(serializeOption(optionName, optionValue));
        addLine();
      }
    }
  }
  return serialized;
};

const serializeAndWriteOne = (bitcoinConfig: SectionedBitcoinConfig, filePath: string) => {
  const serialized = serializeBitcoinConfig(bitcoinConfig);
  const tmpFilePath = `${filePath}.tmp`;
  const oldFilePath = `${filePath}.old`;
  writeFileSync(tmpFilePath, serialized);
  if (existsSync(filePath)) {
    renameSync(filePath, oldFilePath);
  }
  renameSync(tmpFilePath, filePath);
  return serialized;
};

export const writeConfigFiles = (
  bitcoinConfig: SectionedBitcoinConfig,
  options: { conf?: string; datadir?: string } = {},
) => {
  const { conf, datadir } = options;
  const filePath = toAbsolute(conf || BITCOIN_CONF_FILENAME, datadir);
  const fileContents = serializeAndWriteOne(bitcoinConfig, filePath);
  return { filePath, fileContents };
};
