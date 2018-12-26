import { isAbsolute, join } from 'path';
import { getDefaultDatadir } from './default';
import { BITCOIN_CONFIG_OPTIONS, UNKNOWN_OPTION } from './options';
import { SectionName } from './names';

export const toAbsolute = (conf: string, datadir?: string) => {
  if (isAbsolute(conf)) {
    return conf;
  }
  if (datadir && !isAbsolute(datadir)) {
    throw new Error('Path "datadir" must be absolute');
  }
  return join(datadir || getDefaultDatadir(), conf);
};

export const findOption = (maybeOptionName: string, networkName?: SectionName) => {
  const found = Object.entries(BITCOIN_CONFIG_OPTIONS).find(
    ([optionName]) => optionName === maybeOptionName,
  );
  if (!found) {
    return {
      optionName: maybeOptionName,
      option: UNKNOWN_OPTION,
    };
  }
  const optionName = maybeOptionName as keyof typeof BITCOIN_CONFIG_OPTIONS;
  const [, option] = found;
  if (networkName && (option.notAllowedIn as any)[networkName]) {
    throw new Error(`Option "${optionName}" is not allowed for network "${networkName}"`);
  }
  return {
    optionName,
    option,
  };
};
