import { defaultDataDir, readConfFileSync, BitcoinConf, defaultConfFilePath } from '..';
import { join, isAbsolute, dirname } from 'path';
import { writeFileSync } from 'fs';
import mkdirp = require('mkdirp');

describe('defaultDataDir', () => {
  it('should be an absolute path', () => {
    expect(isAbsolute(defaultDataDir)).toBe(true);
  });
});

describe('defaultConfFilePath', () => {
  it('should be "bitcoin.conf" in the default data directory', () => {
    expect(defaultConfFilePath).toBe(join(defaultDataDir, 'bitcoin.conf'));
  });
});

const expectedBitcoinConf: BitcoinConf = {
  rpcauth: ['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9'],
  rpcuser: 'chris',
  rpcpassword: '12345678',
  regtest: '1',
  foo: 'bar',
};

describe('readConfFileSync', () => {
  it('reads the specified file if provided and existent', () => {
    const bitcoinConf = readConfFileSync(join(__dirname, 'bitcoin.conf'));
    expect(bitcoinConf).toEqual(expectedBitcoinConf);
  });

  it('reads defaultConfFilePath if filePath is not provided', () => {
    mkdirp.sync(dirname(defaultConfFilePath));
    try {
      writeFileSync(defaultConfFilePath, '', { flag: 'wx' });
    } catch (ex) {
      if (ex.code !== 'EEXIST') {
        throw ex;
      }
    }
    const bitcoinConf0 = readConfFileSync();
    const bitcoinConf1 = readConfFileSync(defaultConfFilePath);
    expect(bitcoinConf0).toEqual(bitcoinConf1);
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
