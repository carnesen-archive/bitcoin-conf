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

const R_TYPE = {
  [STRING]: STRING as typeof STRING,
  [BOOLEAN]: BOOLEAN as typeof BOOLEAN,
  [STRING_ARRAY]: STRING_ARRAY as typeof STRING_ARRAY,
  [NUMBER]: NUMBER as typeof NUMBER,
};

type RType = keyof typeof R_TYPE;
type RValue<R extends RType> = R extends typeof STRING
  ? string
  : R extends typeof BOOLEAN
    ? boolean
    : R extends typeof NUMBER ? number : R extends typeof STRING_ARRAY ? string[] : never;

// If the following options are in the "top" section, they only apply to the "main" net
const MAIN_ONLY_R_TYPE_MAP = {
  addnode: R_TYPE[STRING_ARRAY],
  bind: R_TYPE[STRING],
  connect: R_TYPE[STRING_ARRAY],
  rpcbind: R_TYPE[STRING],
  rpcport: R_TYPE[NUMBER],
  port: R_TYPE[NUMBER],
  wallet: R_TYPE[STRING_ARRAY],
};

const NETWORK_SELECTION_R_TYPE_MAP = {
  regtest: R_TYPE[BOOLEAN],
  testnet: R_TYPE[BOOLEAN],
};

const NETWORK_SECTION_R_TYPE_MAP = {
  ...MAIN_ONLY_R_TYPE_MAP,
  rpcauth: R_TYPE[STRING_ARRAY],
  rpcpassword: R_TYPE[STRING],
  rpcuser: R_TYPE[STRING],
};

const TOP_SECTION_R_TYPE_MAP = {
  ...NETWORK_SELECTION_R_TYPE_MAP,
  ...NETWORK_SECTION_R_TYPE_MAP,
};

type RTypeMap = {
  [optionName: string]: RType;
};

type Section<T extends RTypeMap = RTypeMap> = Partial<{ [K in keyof T]: RValue<T[K]> }>;
export type TopSection = Section<typeof TOP_SECTION_R_TYPE_MAP>;
export type NetworkSection = Section<typeof NETWORK_SECTION_R_TYPE_MAP>;

export interface BitcoinConf {
  top?: TopSection;
  main?: NetworkSection;
  test?: NetworkSection;
  regtest?: NetworkSection;
}

type NetworkName = 'main' | 'test' | 'regtest';
const NETWORK_NAMES: NetworkName[] = ['main', 'test', 'regtest'];

const castToNetworkName = (str: string) => {
  const networkName = str as NetworkName;
  if (!NETWORK_NAMES.includes(networkName)) {
    throw new Error(`Expected network name to be one of ${NETWORK_NAMES}`);
  }
  return networkName;
};

type SectionName = 'top' | NetworkName;
const SECTION_NAMES: SectionName[] = ['top', ...NETWORK_NAMES];

const castToSectionName = (str: string) => {
  const sectionName = str as SectionName;
  if (!SECTION_NAMES.includes(sectionName)) {
    throw new Error(`Expected section name to be one of ${SECTION_NAMES}`);
  }
  return sectionName;
};

const castToRValue = (rType: RType) => (str: string) => {
  let rValue: RValue<typeof rType>;
  switch (rType) {
    case BOOLEAN:
      rValue = str === '1';
      break;
    case STRING:
      rValue = str;
      break;
    case STRING_ARRAY:
      rValue = [str];
      break;
    case NUMBER:
      rValue = Number(str);
      break;
    default:
      throw new Error(`Unknown runtime type ${rType}`);
  }
  return rValue;
};

const getRType = (rTypeMap: RTypeMap) => (optionName: string) => {
  const rType = rTypeMap[optionName];
  if (!rType) {
    throw new Error(`Unknown option name "${optionName}"`);
  }
  return rType;
};

const getNetworkSectionRType = getRType(NETWORK_SECTION_R_TYPE_MAP);
const getTopSectionRType = getRType(TOP_SECTION_R_TYPE_MAP);

const createParseLine = (sectionName: SectionName) => (line: string): BitcoinConf => {
  const indexOfEqualsSign = line.indexOf('=');
  if (indexOfEqualsSign === -1) {
    throw new Error('Expected "name = value"');
  }
  const lhs = line.slice(0, indexOfEqualsSign).trim();
  if (lhs.length === 0) {
    throw new Error('Empty option name');
  }
  const rhs = line.slice(indexOfEqualsSign + 1).trim();
  if (sectionName === 'top') {
    const indexOfDot = lhs.indexOf('.');
    if (indexOfDot > -1) {
      // sectionName === 'top' && indexOfDot > -1
      const networkName = castToNetworkName(lhs.slice(0, indexOfDot));
      const optionName = lhs.slice(indexOfDot + 1);
      const rType = getNetworkSectionRType(optionName);
      return {
        // [networkName]: { [optionName]: castToRValue(rType)(rhs) },
        [networkName]: castToRValue(rType)(rhs),
      };
    }
    // sectionName === 'top' && indexOfDot === -1
    const optionName = lhs;
    const rType = getTopSectionRType(lhs);
    return {
      [sectionName]: { [optionName]: castToRValue(rType)(rhs) },
    };
  }
  // sectionName !== 'top'
  const optionName = lhs;
  const rType = getNetworkSectionRType(optionName);
  return {
    [sectionName]: { [optionName]: castToRValue(rType)(rhs) },
  };
};

// Note: for single-valued options, the first value takes precedence
const mergeSections = (section0: Section, section1: Section) => {
  const section: Section = {};
  const keys = new Set([...Object.keys(section0), ...Object.keys(section1)]);
  for (const key of keys) {
    const value0 = section0[key];
    const value1 = section1[key];
    if (typeof value0 !== 'undefined') {
      if (Array.isArray(value0) && Array.isArray(value1)) {
        section[key] = [...value0, ...value1];
      } else {
        section[key] = value0;
      }
    } else {
      section[key] = value1;
    }
  }
  return section;
};

const mergeBitcoinConfs = (bitcoinConf0: BitcoinConf, bitcoinConf1: BitcoinConf) => {
  const bitcoinConf: BitcoinConf = {};
  const sectionNames = new Set(
    [...Object.keys(bitcoinConf0), ...Object.keys(bitcoinConf1)].map(castToSectionName),
  );
  for (const sectionName of sectionNames) {
    const section0 = bitcoinConf0[sectionName];
    const section1 = bitcoinConf1[sectionName];
    if (section0 && section1) {
      bitcoinConf[sectionName] = mergeSections(section0, section1);
    } else {
      bitcoinConf[sectionName] = section0 || section1;
    }
  }
  return bitcoinConf;
};

const parseBitcoinConf = (str: string) => {
  let bitcoinConf: BitcoinConf = {};
  let parseLine = createParseLine('top');
  str.split('\n').forEach((originalLine, index) => {
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

      // [main/test/regtest] https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (line.startsWith('[') && line.endsWith(']')) {
        const networkName = castToNetworkName(line.slice(1, -1));
        parseLine = createParseLine(networkName);
        return;
      }

      // name = value
      bitcoinConf = mergeBitcoinConfs(bitcoinConf, parseLine(line));
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${index + 1}: ${originalLine}`);
    }
  });
  return bitcoinConf;
};

export const readConfFileSync = (filePath = getDefaultConfFilePath()) => {
  if (!isAbsolute(filePath)) {
    throw new Error('File path must be absolute');
  }
  const fileContents = readFileSync(filePath, { encoding: 'utf8' });
  return parseBitcoinConf(fileContents);
};

export const extractNetworkConf = (
  bitcoinConf: BitcoinConf,
  networkName: NetworkName,
) => {
  const topConf = bitcoinConf.top;
  const conf: any = { ...topConf };
  for (const name of Object.keys(NETWORK_SELECTION_R_TYPE_MAP)) {
    delete conf[name];
  }
  if (networkName !== 'main') {
    for (const name of Object.keys(MAIN_ONLY_R_TYPE_MAP)) {
      delete conf[name];
    }
  }
  Object.assign(conf, bitcoinConf[networkName]);
  return conf as NetworkSection;
};

export const extractNetwork = (bitcoinConf: BitcoinConf) => {
  let networkName: NetworkName = 'main';
  if (bitcoinConf.top) {
    if (bitcoinConf.top.regtest && bitcoinConf.top.testnet) {
      throw new Error('regtest and testnet cannot both be set to true');
    }
    if (bitcoinConf.top.regtest) {
      networkName = 'regtest';
    } else if (bitcoinConf.top.testnet) {
      networkName = 'test';
    }
  }
  const networkConf: NetworkSection = extractNetworkConf(bitcoinConf, networkName);
  return {
    networkName,
    networkConf,
  };
};
