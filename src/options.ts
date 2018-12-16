import { R_TYPE } from './r-type';

export const NETWORK_SELECTION_OPTIONS = {
  regtest: R_TYPE['BOOLEAN'],
  testnet: R_TYPE['BOOLEAN'],
};

// If the following options are not in a section, they only apply to the "main" chain
export const MAIN_ONLY_OPTIONS = {
  addnode: R_TYPE['STRING_ARRAY'],
  bind: R_TYPE['STRING'],
  connect: R_TYPE['STRING_ARRAY'],
  rpcbind: R_TYPE['STRING'],
  rpcport: R_TYPE['NUMBER'],
  port: R_TYPE['NUMBER'],
  wallet: R_TYPE['STRING_ARRAY'],
};

const OTHER_OPTIONS = {
  datadir: R_TYPE['STRING'],
  dbbatchsize: R_TYPE['NUMBER'],
  includefile: R_TYPE['STRING_ARRAY'],
  rpcauth: R_TYPE['STRING_ARRAY'],
  rpcpassword: R_TYPE['STRING'],
  rpcuser: R_TYPE['STRING'],
};

export const TOP_OPTIONS = {
  ...NETWORK_SELECTION_OPTIONS,
  ...MAIN_ONLY_OPTIONS,
  ...OTHER_OPTIONS,
};

export const SECTION_OPTIONS = {
  ...MAIN_ONLY_OPTIONS,
  ...OTHER_OPTIONS,
};
