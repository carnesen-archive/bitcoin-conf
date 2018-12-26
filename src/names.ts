const createCastToName = <N extends string>(names: N[]) => (maybeName: string) => {
  const name = maybeName as N;
  if (!names.includes(name)) {
    throw new Error(`Expected name to be one of ${names}`);
  }
  return name;
};

export type TypeName = 'string' | 'string[]' | 'boolean' | 'number';

export const SECTION_NAMES = ['main' as 'main', 'regtest' as 'regtest', 'test' as 'test'];
export type SectionName = (typeof SECTION_NAMES)[number];
export const castToSectionName = createCastToName(SECTION_NAMES);
