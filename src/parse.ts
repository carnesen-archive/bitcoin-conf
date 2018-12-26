import { SectionedBitcoinConfig } from './config';
import { findOption } from './util';
import { castToSectionName, TypeName, SectionName } from './names';

const castToValue = (typeName: TypeName) => (str: string) => {
  switch (typeName) {
    case 'string': {
      return str;
    }
    case 'string[]': {
      return [str];
    }
    case 'boolean': {
      return str === '1';
    }
    case 'number': {
      return Number(str);
    }
    default:
      throw new Error(`Unknown type name ${typeName}`);
  }
};

const createParseLine = (context: SectionName | null) => (
  line: string,
): SectionedBitcoinConfig => {
  const indexOfEqualsSign = line.indexOf('=');
  if (indexOfEqualsSign === -1) {
    throw new Error('Expected "name = value"');
  }
  const lhs = line.slice(0, indexOfEqualsSign).trim();
  if (lhs.length === 0) {
    throw new Error('Empty option name');
  }
  const rhs = line.slice(indexOfEqualsSign + 1).trim();
  if (context === null) {
    const indexOfDot = lhs.indexOf('.');
    if (indexOfDot > -1) {
      // context === null && indexOfDot > -1
      // This line specifies the section using dot notation, e.g. main.uacomment=main network
      const maybeSectionName = lhs.slice(0, indexOfDot);
      const sectionName = castToSectionName(maybeSectionName);
      const maybeOptionName = lhs.slice(indexOfDot + 1);
      const { optionName, option } = findOption(maybeOptionName, sectionName);
      return {
        sections: { [sectionName]: { [optionName]: castToValue(option.typeName)(rhs) } },
      };
    }
    // context === 'top' && indexOfDot === -1
    const maybeOptionName = lhs;
    const { optionName, option } = findOption(maybeOptionName);
    return {
      sections: {
        [context]: { [optionName]: castToValue(option.typeName)(rhs) },
      },
    };
  }
  // sectionName !== null
  if (lhs.indexOf('.') > -1) {
    throw new Error('Dot notation is only allowed in top section');
  }
  const maybeOptionName = lhs;
  const { optionName, option } = findOption(maybeOptionName, context);
  return {
    [context]: { [optionName]: castToValue(option.typeName)(rhs) },
  };
};

// Similar to Bitcoin's GetConfigOptions
export const parseBitcoinConf = (str: string) => {
  let bitcoinConfig: SectionedBitcoinConfig = {};
  let parseLine = createParseLine('top');
  str.split('\n').forEach((originalLine, index) => {
    try {
      let line = originalLine;

      // Remove comments
      const indexOfPoundSign = line.indexOf('#');
      if (indexOfPoundSign > -1) {
        line = line.slice(0, indexOfPoundSign);
        if (line.includes('rpcpassword')) {
          throw new Error('rpcpassword option line cannot have comments');
        }
      }

      // Trim whitespace
      line = line.trim();

      if (line.length === 0) {
        return;
      }

      // [main/test/regtest] https://bitcoincore.org/en/releases/0.17.0/#configuration-sections-for-testnet-and-regtest
      if (line.startsWith('[') && line.endsWith(']')) {
        const sectionName = castToSectionName(line.slice(1, -1));
        parseLine = createParseLine(sectionName);
        return;
      }

      // name = value
      bitcoinConfig = mergeBitcoinConfigsWithSections(bitcoinConfig, parseLine(line));
    } catch (ex) {
      throw new Error(`Parse error: ${ex.message}: line ${index + 1}: ${originalLine}`);
    }
  });
  return bitcoinConfig;
};
