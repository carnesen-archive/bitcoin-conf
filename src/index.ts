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

const STRING = 'STRING';
const BOOLEAN = 'BOOLEAN';
const STRING_ARRAY = 'STRING_ARRAY';
const NUMBER = 'NUMBER';

const RT_TYPE = {
  [STRING]: STRING as typeof STRING,
  [BOOLEAN]: BOOLEAN as typeof BOOLEAN,
  [STRING_ARRAY]: STRING_ARRAY as typeof STRING_ARRAY,
  [NUMBER]: NUMBER as typeof NUMBER,
};

type RtType = keyof typeof RT_TYPE;
type TsType<R extends RtType> = R extends typeof STRING
  ? string
  : R extends typeof BOOLEAN
    ? boolean
    : R extends typeof NUMBER ? number : R extends typeof STRING_ARRAY ? string[] : never;

const SPECIAL_OPTIONS = {
  addnode: RT_TYPE[STRING_ARRAY],
  bind: RT_TYPE[STRING],
  connect: RT_TYPE[STRING_ARRAY],
  rpcbind: RT_TYPE[STRING],
  rpcport: RT_TYPE[NUMBER],
  port: RT_TYPE[NUMBER],
  wallet: RT_TYPE[STRING_ARRAY],
};

const NETWORK_SECTION_OPTIONS = {
  ...SPECIAL_OPTIONS,
  rpcauth: RT_TYPE[STRING_ARRAY],
  rpcpassword: RT_TYPE[STRING],
  rpcuser: RT_TYPE[STRING],
};
type NetworkSectionOptions = TsOptions<typeof NETWORK_SECTION_OPTIONS>;

const TOP_SECTION_OPTIONS = {
  regtest: RT_TYPE[BOOLEAN],
  testnet: RT_TYPE[BOOLEAN],
  ...NETWORK_SECTION_OPTIONS,
};
type TopSectionOptions = TsOptions<typeof TOP_SECTION_OPTIONS>;

type TsOptions<
  T extends {
    [x: string]: RtType;
  }
> = { [K in keyof T]: TsType<T[K]> };

type OtherOptions = {
  other: {
    [x: string]: string[];
  };
};

type TopSection = Partial<TopSectionOptions & OtherOptions>;
type NetworkSection = Partial<NetworkSectionOptions & OtherOptions>;

export interface BitcoinConf {
  top: TopSection;
  main?: NetworkSection;
  test?: NetworkSection;
  regtest?: NetworkSection;
}

function cast(value: string, rtType: RtType) {
  switch (rtType) {
    case BOOLEAN:
      return value === '1';
    case STRING:
      return value;
    case STRING_ARRAY:
      return [value];
    case NUMBER:
      return Number(value);
    default:
      throw new Error(`Unknown runtime type ${rtType}`);
  }
}

const parse = (fileContents: string) => {
  const bitcoinConf: BitcoinConf = {
    top: {},
  };
  let sectionName: keyof BitcoinConf = 'top';
  fileContents.split('\n').forEach((originalLine, index) => {
    try {
      let line = originalLine;

      // Remove comments
      const indexOfPoundSign = line.indexOf('#');
      if (indexOfPoundSign > -1) {
        line = line.slice(0, indexOfPoundSign);
      }

      // Trim whitespace
      line = line.trim();

      if (line.length === 0) {
        return;
      }

      // Section https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (line.startsWith('[') && line.endsWith(']')) {
        const rawSectionName = line.slice(1, -1);
        switch (rawSectionName) {
          case 'top':
            throw new Error('Section name "top" is reserved');
          case 'main':
          case 'test':
          case 'regtest':
            sectionName = rawSectionName;
            return;
          default:
            throw new Error(`Unknown section name "${rawSectionName}`);
        }
      }

      // Key = Value
      const indexOfEqualsSign = line.indexOf('=');
      if (indexOfEqualsSign === -1) {
        throw new Error('Expected "key = value"');
      }
      const key = line.slice(0, indexOfEqualsSign).trim();
      if (key.length === 0) {
        throw new Error('Zero-length key');
      }
      const rawValue = line.slice(indexOfEqualsSign + 1).trim();
      const rtType: RtType | undefined = (NETWORK_SECTION_OPTIONS as any)[key];
      if (typeof rtType === 'undefined') {
        if (section.other) {
          const existingValue = section.other[key];
          if (existingValue) {
            existingValue.push(rawValue);
          } else {
            section.other[key] = [rawValue];
          }
        } else {
          section.other = {
            [key]: [rawValue],
          };
        }
      } else {
        // Known config value
        const rtValue = cast(rawValue, rtType);
        const existingRtValue = (section as any)[key];
        if (typeof existingRtValue === 'undefined') {
          (section as any)[key] = rtValue;
        } else {
          if (rtType.endsWith('ARRAY')) {
            existingRtValue.push(...(rtValue as any[]));
          } else {
            // For non-ARRAY types, subsequent values are ignored
          }
        }
      }
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${index + 1}: ${originalLine}`);
    }
  });
  return bitcoinConf;
};

export const readConfFileSync = (filePath = getDefaultConfFilePath()) => {
  if (!isAbsolute(filePath)) {
    throw new Error(`File path must be absolute`);
  }
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parse(fileContents);
};

export const extractCurrentNetworkConf = (bitcoinConf: BitcoinConf) => {
  const topSection = bitcoinConf[TOP_SECTION_NAME];
};
