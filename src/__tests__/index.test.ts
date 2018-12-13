import {
  getDefaultDataDir,
  readConfFileSync,
  getDefaultConfFilePath,
  BitcoinConf,
  extractNetworkConf,
  extractNetwork,
} from '..';
import { join, isAbsolute } from 'path';

describe('getDefaultDataDir', () => {
  it('should be an absolute path', () => {
    expect(isAbsolute(getDefaultDataDir())).toBe(true);
  });
});

describe('getDefaultConfFilePath', () => {
  it('should be "bitcoin.conf" in the default data directory', () => {
    expect(getDefaultConfFilePath()).toBe(join(getDefaultDataDir(), 'bitcoin.conf'));
  });
});

const expectedBitcoinConf: BitcoinConf = {
  top: {
    rpcuser: 'chris',
    rpcpassword: '12345678',
    regtest: true,
    rpcport: 55555,
  },
  main: {
    rpcauth: ['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9'],
  },
  regtest: {
    rpcport: 44444,
  },
};

describe('readConfFileSync', () => {
  it('reads the specified file if provided and existent', () => {
    const bitcoinConf = readConfFileSync(join(__dirname, 'bitcoin.conf'));
    expect(bitcoinConf).toEqual(expectedBitcoinConf);
  });

  it('throws if a non-absolute path is provided', () => {
    const shouldThrow = () => readConfFileSync('bitcoin.conf');
    expect(shouldThrow).toThrow(/must be absolute/);
  });

  it('throws if a non-existent path is provided', () => {
    const shouldThrow = () => readConfFileSync(join(__dirname, 'oops.conf'));
    expect(shouldThrow).toThrow(/no such file or directory/);
  });
});

describe('extractNetworkConf', () => {
  it('extracts a network configuration from a full bitcoin conf', () => {
    expect(extractNetworkConf(expectedBitcoinConf, 'main')).toEqual({
      rpcuser: 'chris',
      rpcpassword: '12345678',
      rpcport: 55555,
      rpcauth: ['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9'],
    });
    expect(extractNetworkConf(expectedBitcoinConf, 'test')).toEqual({
      rpcuser: 'chris',
      rpcpassword: '12345678',
    });
    expect(extractNetworkConf(expectedBitcoinConf, 'regtest')).toEqual({
      rpcuser: 'chris',
      rpcpassword: '12345678',
      rpcport: 44444,
    });
  });
});

describe('extractNetwork', () => {
  it('extracts the "active" network configuration', () => {
    expect(extractNetwork(expectedBitcoinConf)).toEqual({
      networkName: 'regtest',
      networkConf: extractNetworkConf(expectedBitcoinConf, 'regtest'),
    });
  });
});
