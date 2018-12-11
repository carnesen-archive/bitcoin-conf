import { isAbsolute, join } from 'path';
import { platform, homedir } from 'os';
import { readFileSync } from 'fs';

export const getDefaultDataDir = (p = platform()) => {
  let dataDir: string;
  switch (p) {
    case 'darwin':
      dataDir = join(homedir(), 'Library', 'Application Support', 'Bitcoin');
      break;
    case 'win32':
      if (!process.env.APPDATA) {
        throw new Error('Expected to find environment variable "APPDATA"');
      }
      dataDir = join(process.env.APPDATA, 'Bitcoin');
      break;
    default:
      dataDir = join(homedir(), '.bitcoin');
  }
  return dataDir;
};

export const getDefaultConfFilePath = (p = platform()) =>
  join(getDefaultDataDir(p), 'bitcoin.conf');

type Section = {
  [name: string]: string | string[] | undefined;
};

const SECTION_NAMES = ['main', 'test', 'regtest'];
export type BitcoinConf = Partial<{
  top: Section;
  main: Section;
  test: Section;
  regtest: Section;
}>;

const STRING = 'STRING';
const FLAG = 'FLAG';

const RUNTIME_TYPES = {
  [STRING]: STRING as typeof STRING,
  [FLAG]: FLAG as typeof FLAG,
};

const BITCOIN_CONF = {
  rpcuser: RUNTIME_TYPES[STRING],
  regtest: RUNTIME_TYPES[FLAG],
};

type TsType<R extends keyof typeof RUNTIME_TYPES> = R extends typeof STRING
  ? string
  : R extends typeof FLAG ? boolean : any;

type BC = { [K in keyof typeof BITCOIN_CONF]: TsType<(typeof BITCOIN_CONF)[K]> };

interface All extends BC {
  [x: string]: any;
}

const a: All = {
  regtest: '1',
};

type Foo = {
  regtest: string;
  [x: string]: string | string[] | undefined;
};

const parseConf = (fileContents: string) => {
  const bitcoinConf: BitcoinConf = {
    top: {},
  };
  let section = bitcoinConf.top!;

  fileContents.split('\n').forEach((line, index) => {
    try {
      // Strip out comments
      const commentCharIndex = line.indexOf('#');
      let strippedLine = line;
      if (commentCharIndex > -1) {
        strippedLine = line.slice(0, commentCharIndex);
      }

      // Trim whitespace
      const trimmedLine = strippedLine.trim();

      // Sections https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        const sectionName = trimmedLine.slice(1, -1) as keyof BitcoinConf;
        if (!SECTION_NAMES.includes(sectionName)) {
          throw new Error(`Section name must be one of ${SECTION_NAMES}`);
        }
        const existingSection = bitcoinConf[sectionName];
        if (existingSection) {
          section = existingSection;
        } else {
          section = {};
          bitcoinConf[sectionName] = section;
        }
        return;
      }

      // Empty lines are ok
      if (trimmedLine.length === 0) {
        return;
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
      const existingValue = section[key];
      if (typeof existingValue === 'string') {
        section[key] = [existingValue, value];
      } else if (Array.isArray(existingValue)) {
        section[key] = [...existingValue, value];
      } else if (!existingValue) {
        section[key] = value;
      } else {
        throw new Error(`Key "${key}" duplicates section name`);
      }
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${index + 1}: ${line}`);
    }
  });
  return bitcoinConf;
};

export const readConfFileSync = (filePath = defaultConfFilePath) => {
  if (!isAbsolute(filePath)) {
    throw new Error(`File path must be absolute`);
  }
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parseConf(fileContents);
};
