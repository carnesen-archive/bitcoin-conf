import { readConfigFiles, writeConfigFiles } from '..';
import { BitcoinConfig } from '../config';

describe('readConfFiles', () => {
  it('reads the specified conf file and its "includeconf" files', () => {
    const datadir = __dirname;
    const config = readConfigFiles({ datadir });
    expect(config.datadir).toBe(undefined); // passed datadir does not get merged in
    expect(config.rpcuser).toBe('carnesen');
    expect(config.rpcauth).toEqual(['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9']);
    expect(config.rpcport).toBe(44444);
    expect(config.rpcpassword).toBe('top-password');
    expect(config.rpcbind).toBe('10.10.10.10'); // included-from-section.conf
    expect(config.dbbatchsize).toBe(12345); // included-from-top.conf
  });
  it('reads the specified conf file and with defaults', () => {
    const datadir = __dirname;
    const config = readConfigFiles({ datadir, withDefaults: true });
    expect(config.rpcuser).toBe('carnesen');
    expect(config.rpcauth).toEqual(['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9']);
    expect(config.rpcport).toBe(44444);
    expect(config.rpcpassword).toBe('top-password');
    expect(config.rpcbind).toBe('10.10.10.10'); // included-from-section.conf
    expect(config.dbbatchsize).toBe(12345); // included-from-top.conf
    expect(config.discardfee).toBe(0.0001); // default value
  });
});

describe('writeConfFiles and readConfFiles', () => {
  it('reads and writes', () => {
    const bitcoinConfig: BitcoinConfig = {
      top: {
        rpcuser: 'carnesen',
        rpcauth: ['foo', 'bar'],
      },
      regtest: {
        avoidpartialspends: true,
      },
    };
    const datadir = __dirname;
    const options = { datadir, conf: 'tmp.conf' };
    writeConfigFiles(bitcoinConfig, options);
    const topConfig = readConfigFiles(options);
    expect(topConfig).toEqual(bitcoinConfig.top);
  });
});
