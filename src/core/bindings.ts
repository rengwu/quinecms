import type { Block, Field, Values } from './types';

export function bindingCompatible(source: Field, target: Field) {
  return (
    source.type === target.type &&
    source.type !== 'custom' &&
    source.type !== 'collection'
  );
}

// Keep bindings separate from literal props: empty entry values use the literal
// fallback, while false and zero are real values. Validation rejects broken keys.
export function resolveBlock(block: Block, values: Values): Block {
  const props = { ...block.props };
  for (const [key, source] of Object.entries(block.bindings ?? {})) {
    const value = values[source];
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && !value.trim());
    props[key] = empty ? (props[key] ?? null) : value;
  }
  return { ...block, props };
}

export function bindingPlaceholders(block: Block) {
  return Object.fromEntries(
    Object.entries(block.bindings ?? {}).map(([key, source]) => [
      key,
      `{{${source}}}`,
    ]),
  );
}
