import { defaultBitcoinDataDir, readBitcoinConfSync, BitcoinConf } from '..';
import { join, isAbsolute } from 'path';

describe('defaultBitcoinDataDir', () => {
  it('should be an absolute path', () => {
    expect(isAbsolute(defaultBitcoinDataDir)).toBe(true);
  });
});

const expectedBitcoinConf: BitcoinConf = {
  rpcuser: 'chris',
  rpcpassword: '12345678',
  regtest: '1',
  foo: 'bar',
};

describe('readBitcoinConfSync', () => {
  it('reads the specified file if provided and existent', () => {
    const bitcoinConf = readBitcoinConfSync(join(__dirname, 'bitcoin.conf'));
    expect(bitcoinConf).toEqual(expectedBitcoinConf);
  });
  it('throws if a non-absolute path is provided', () => {
    const shouldThrow = () => readBitcoinConfSync('bitcoin.conf');
    expect(shouldThrow).toThrow(/must be absolute/);
  });
  it('throws if a non-existent path is provided', () => {
    const shouldThrow = () => readBitcoinConfSync(join(__dirname, 'oops.conf'));
    expect(shouldThrow).toThrow(/no such file or directory/);
  });
});
