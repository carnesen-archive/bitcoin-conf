# @carnesen/bitcoin-conf [![Build Status](https://travis-ci.org/carnesen/bitcoin-conf.svg?branch=master)](https://travis-ci.org/carnesen/bitcoin-conf)

Constants and utilities related to Bitcoin server software configuration

## Install

```
$ npm install @carnesen/bitcoin-conf
```

## Usage

```js
const { readConfFileSync } = require('@carnesen/bitcoin-conf');

readBitcoinConfSync(defaultBitcoinConfPath);
//=> { rpcuser: 'carnesen', rpcpassword: '12345678' }
```


## API

### readBitcoinConfSync(path)

#### path

Type: `string`

Absolute path to a bitcoin configuration file

#### type

Type: `string`<br>
Values: `patch` `minor` `major`

Version type to truncate to.


## Related

- [latest-semver](https://github.com/sindresorhus/latest-semver) - Get the latest stable semver version from an array of versions
- [to-semver](https://github.com/sindresorhus/to-semver) - Get an array of valid, sorted, and cleaned semver versions from an array of strings
- [semver-regex](https://github.com/sindresorhus/semver-regex) - Regular expression for matching semver versions
- [semver-diff](https://github.com/sindresorhus/semver-diff) - Get the diff type of two semver versions: `0.0.1` `0.0.2` → `patch`


## License

MIT © [Chris Arnesen](https://www.carnesen.com)