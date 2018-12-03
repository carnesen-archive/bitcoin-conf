import { isAbsolute, join } from 'path';
import { platform, homedir } from 'os';
import { readFileSync } from 'fs';

export let defaultDataDir: string;
switch (platform()) {
  case 'darwin':
    defaultDataDir = join(homedir(), 'Library', 'Application Support', 'Bitcoin');
    break;
  case 'win32':
    if (!process.env.APPDATA) {
      throw new Error('Expected to find environment variable "APPDATA"');
    }
    defaultDataDir = join(process.env.APPDATA, 'Bitcoin');
    break;
  default:
    defaultDataDir = join(homedir(), '.bitcoin');
}

export const defaultConfFilePath = join(defaultDataDir, 'bitcoin.conf');

const parseLine = (line: string) => {
  // Strip out comments
  const commentCharIndex = line.indexOf('#');
  let strippedLine = line;
  if (commentCharIndex > -1) {
    strippedLine = line.slice(0, commentCharIndex);
  }
  if (strippedLine.includes('rpcpassword')) {
    throw new Error('End-of-line comments are not allowed with rpcpassword');
  }

  // Trim whitespace
  const trimmedLine = strippedLine.trim();

  // Bitcoin doesn't complain about key "sections" but nor does it use them
  if (trimmedLine.startsWith('[')) {
    throw new Error('INI "sections" are not supported');
  }

  // Empty lines are ok
  if (trimmedLine.length === 0) {
    return null;
  }

  const separatorIndex = trimmedLine.indexOf('=');
  if (separatorIndex === -1) {
    throw new Error('Expected key and value to be separated by "="');
  }
  const key = trimmedLine.slice(0, separatorIndex).trim();
  if (key.length === 0) {
    throw new Error('Zero-length key');
  }
  const value = trimmedLine.slice(separatorIndex + 1).trim();
  const parsedLine: [string, string] = [key, value];
  return parsedLine;
};

export type Flag = '0' | '1';
export const isEnabled = (flag?: Flag) => flag === '1';

export type BitcoinConf = Partial<{
  datadir: string;
  regtest: Flag;
  rpcauth: string[];
  rpcuser: string;
  rpcpassword: string;
  rpcport: string;
  rpccookiefile: string;
  testnet: Flag;
}>;

type RuntimeType = 'string' | 'string[]' | 'flag';

type StaticType<R extends RuntimeType> = R extends 'string'
  ? string
  : R extends 'string[]' ? string[] : R extends 'flag' ? boolean : never;
// Record<keyof BitcoinConf, 'string'>

const enum RuntimeType = {

}

const runtimeTypeObject = {
  datadir: 'string',
  regtest: 'flag',
  rpcauth: 'string[]',
  rpcuser: 'string',
  rpcpassword: 'string',
  rpcport: 'string',
  rpccookiefile: 'string',
  testnet: 'flag',
};

type BitcoinConf2 = { K in typeof runtimeTypeObject }

const parseConf = (fileContents: string) => {
  const parsedLines = fileContents.split('\n').map((line, index) => {
    try {
      return parseLine(line);
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${index}: ${line}`);
    }
  });
  const bitcoinConf: BitcoinConf = {};
  parsedLines.forEach(parsedLine => {
    if (!parsedLine) {
      return;
    }
    const [key, value] = parsedLine;
  });
};

export const readConfFileSync = (filePath = defaultConfFilePath) => {
  if (!isAbsolute(filePath)) {
    throw new Error(`File path must be absolute`);
  }
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  const bitcoinConf: BitcoinConf = parseConf(fileContents);
  return bitcoinConf;
};
