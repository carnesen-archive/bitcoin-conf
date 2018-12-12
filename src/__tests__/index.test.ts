import {
  getDefaultDataDir,
  readConfFileSync,
  getDefaultConfFilePath,
  BitcoinConf,
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
    rpcauth: ['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9'],
    rpcport: 55555,
  },
  regtest: {
    rpcport: 44444,
    other: {
      foo: ['bar'],
    },
  },
  test: {},
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
