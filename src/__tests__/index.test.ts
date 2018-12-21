import { readConfFiles } from '..';

describe('readConfFiles', () => {
  it('reads the specified conf file and its "includeconf" files too with defaults', () => {
    const datadir = __dirname;
    const config = readConfFiles({ datadir });
    expect(config.datadir).toBe(datadir);
    expect(config.rpcuser).toBe('carnesen');
    expect(config.rpcauth).toEqual(['foo:edbb8eb$fae09e4', 'bar:b40474b$79f29e9']);
    expect(config.rpcport).toBe(44444);
    expect(config.rpcpassword).toBe('top-password');
    expect(config.rpcbind).toBe('10.10.10.10'); // included-from-section.conf
    expect(config.dbbatchsize).toBe(12345); // included-from-top.conf
    expect(config.discardfee).toBe(0.0001); // default value
  });
});
