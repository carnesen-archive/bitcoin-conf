const createCastToName = <N extends string>(names: N[]) => (maybeName: string) => {
  const name = maybeName as N;
  if (!names.includes(name)) {
    throw new Error(`Expected name to be one of ${names}`);
  }
  return name;
};

export type TypeName = 'string' | 'string[]' | 'boolean' | 'number';

export const NETWORK_NAMES = ['main' as 'main', 'regtest' as 'regtest', 'test' as 'test'];
export type NetworkName = (typeof NETWORK_NAMES)[number];
export const castToNetworkName = createCastToName(NETWORK_NAMES);

export const SECTION_NAMES = ['top' as 'top', ...NETWORK_NAMES];
export type SectionName = (typeof SECTION_NAMES)[number];
