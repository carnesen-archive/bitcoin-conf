import { isAbsolute, join } from 'path';
import { getDefaultDatadir } from './default';
import { BITCOIN_CONFIG_OPTIONS } from './options';

export const toAbsolute = (filePath: string, datadir?: string) => {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error('Path "datadir" must be absolute');
  }
  return join(datadir || getDefaultDatadir(), filePath);
};

export const findOption = (maybeOptionName: string) => {
  const found = Object.entries(BITCOIN_CONFIG_OPTIONS).find(
    ([optionName]) => optionName === maybeOptionName,
  );
  if (!found) {
    throw new Error(`Unknown option name "${maybeOptionName}"`);
  }
  const optionName = maybeOptionName as keyof typeof BITCOIN_CONFIG_OPTIONS;
  const [, option] = found;
  return {
    optionName,
    option,
  };
};
