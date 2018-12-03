import { isAbsolute, join } from 'path';
import { platform, homedir } from 'os';
import { readFileSync } from 'fs';
import { decode } from 'ini';

export type Flag = '0' | '1';
export const isEnabled = (flag?: Flag) => flag === '1';

export type BitcoinConf = Partial<{
  [x: string]: any;
  rpcuser: string;
  rpcpassword: string;
  rpcport: string;
  rpccookiefile: string;
  testnet: Flag;
  regtest: Flag;
  datadir: string;
}>;

export let defaultBitcoinDataDir: string;
switch (platform()) {
  case 'darwin':
    defaultBitcoinDataDir = join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    break;
  case 'win32':
    if (!process.env.APPDATA) {
      throw new Error('Expected to find environment variable "APPDATA"');
    }
    defaultBitcoinDataDir = join(process.env.APPDATA, 'Bitcoin');
    break;
  default:
    defaultBitcoinDataDir = join(homedir(), '.bitcoin');
}

export const defaultBitcoinConfPath = join(defaultBitcoinDataDir, 'bitcoin.conf');

export const readBitcoinConfSync = (path: string) => {
  if (!isAbsolute(path)) {
    throw new Error(`File path must be absolute`);
  }
  const fileContents = readFileSync(path, { encoding: 'utf8' });
  const bitcoinConf: BitcoinConf = decode(fileContents);
  return bitcoinConf;
};
