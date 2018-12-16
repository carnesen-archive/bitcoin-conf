import { join } from 'path';
import { platform, homedir } from 'os';
import { BitcoinConfig } from './types';

export const BITCOIN_CONF_FILENAME = 'bitcoin.conf';

export const getDefaultDatadir = (p = platform()) => {
  switch (p) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    case 'win32':
      if (!process.env.APPDATA) {
        throw new Error('Expected to find environment variable "APPDATA"');
      }
      return join(process.env.APPDATA, 'Bitcoin');
    default:
      return join(homedir(), '.bitcoin');
  }
};

export const getDefaultBitcoinConfig = (p = platform()) => {
  const datadir = getDefaultDatadir(p);
  const bitcoinConfig: BitcoinConfig = {
    top: {
      datadir,
    },
    main: {
      port: 8333,
      rpcport: 8332,
    },
    test: {
      port: 18333,
      rpcport: 18332,
    },
    regtest: {
      port: 18444,
      rpcport: 18443,
    },
  };
  return bitcoinConfig;
};
