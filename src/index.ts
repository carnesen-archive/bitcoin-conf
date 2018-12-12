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

const KNOWN_CONF = {
  regtest: RT_TYPE[BOOLEAN],
  rpcauth: RT_TYPE[STRING_ARRAY],
  rpcpassword: RT_TYPE[STRING],
  rpcport: RT_TYPE[NUMBER],
  rpcuser: RT_TYPE[STRING],
  testnet: RT_TYPE[BOOLEAN],
};

type TsType<R extends RtType> = R extends typeof STRING
  ? string
  : R extends typeof BOOLEAN
    ? boolean
    : R extends typeof NUMBER ? number : R extends typeof STRING_ARRAY ? string[] : never;

type KnownConf = { [K in keyof typeof KNOWN_CONF]: TsType<(typeof KNOWN_CONF)[K]> };

type OtherConf = {
  [x: string]: string[];
};

type SectionConf = Partial<
  KnownConf & {
    other: OtherConf;
  }
>;

export type BitcoinConf = Partial<{
  [sectionName: string]: SectionConf;
}>;

// function cast(value: string, runtimeType: typeof STRING): TsType<typeof STRING>;
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

const parseConf = (fileContents: string) => {
  let sectionConf: SectionConf = {};
  const bitcoinConf: BitcoinConf = {
    top: sectionConf,
  };

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

      // Empty line
      if (line.length === 0) {
        return;
      }

      // Section https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (line.startsWith('[') && line.endsWith(']')) {
        const sectionName = line.slice(1, -1);
        const existingSection = bitcoinConf[sectionName];
        if (existingSection) {
          sectionConf = existingSection;
        } else {
          sectionConf = {};
          bitcoinConf[sectionName] = sectionConf;
        }
        return;
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
      const rtType: RtType | undefined = (KNOWN_CONF as any)[key];
      if (typeof rtType === 'undefined') {
        if (sectionConf.other) {
          const existingValue = sectionConf.other[key];
          if (existingValue) {
            existingValue.push(rawValue);
          } else {
            sectionConf.other[key] = [rawValue];
          }
        } else {
          sectionConf.other = {
            [key]: [rawValue],
          };
        }
      } else {
        // Known config value
        const rtValue = cast(rawValue, rtType);
        const existingRtValue = (sectionConf as any)[key];
        if (typeof existingRtValue === 'undefined') {
          (sectionConf as any)[key] = rtValue;
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
  return parseConf(fileContents);
};
