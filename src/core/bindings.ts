import type { Binding, Block, Field, Json, Values } from './types';
import {
  emptyModel,
  isRecord,
  itemScope,
  objectFields,
  resolvePath,
  rowFields,
  type Model,
  type Scope,
  pathLimit,
} from './schema';

export function bindingCompatible(
  source: Field,
  target: Field,
  model: Model = emptyModel,
): boolean {
  const sf =
    source.type === 'array' && source.of.type === 'reference'
      ? itemScope(source.of, null, model)?.fields
      : rowFields(source, model);
  const tf = rowFields(target, model);
  if (sf && tf)
    return tf.every((f) => {
      const child = sf.find((s) => s.key === f.key);
      return child ? bindingCompatible(child, f, model) : !f.required;
    });
  if (source.type === 'object' && target.type === 'object')
    return objectFields(target, model).every((f) => {
      const child = objectFields(source, model).find((s) => s.key === f.key);
      return child ? bindingCompatible(child, f, model) : !f.required;
    });
  return (
    source.type === target.type &&
    !['custom', 'collection', 'reference', 'array'].includes(source.type)
  );
}
export function bindingShape(value: unknown, depth = 0): value is Binding {
  if (depth > pathLimit) return false;
  if (typeof value === 'string')
    return (
      value.split('.').length <= pathLimit &&
      /^[a-zA-Z]\w*(\.[a-zA-Z]\w*)*$/.test(value)
    );
  return (
    isRecord(value) &&
    typeof value.source === 'string' &&
    bindingShape(value.source, depth + 1) &&
    isRecord(value.fields) &&
    Object.entries(value.fields).every(
      ([key, v]) => /^[a-zA-Z]\w*$/.test(key) && bindingShape(v, depth + 1),
    )
  );
}
export const bindingSource = (binding: Binding) =>
  typeof binding === 'string' ? binding : binding.source;
export function bindingValid(
  binding: Binding,
  target: Field,
  scope: Scope,
  model: Model,
  depth = 0,
): boolean {
  if (depth > pathLimit || !bindingShape(binding)) return false;
  const result = resolvePath(bindingSource(binding), scope, model);
  if (!result) return false;
  if (typeof binding === 'string')
    return bindingCompatible(result.field, target, model);
  const children = rowFields(target, model);
  const source = result.field;
  const item =
    source.type === 'array'
      ? itemScope(source.of, null, model)
      : source.type === 'list'
        ? { fields: source.fields, values: {} }
        : undefined;
  return (
    !!children &&
    !!item &&
    Object.keys(binding.fields).every((key) =>
      children.some((f) => f.key === key),
    ) &&
    children.every((f) => {
      const mapping = binding.fields[f.key];
      return mapping
        ? bindingValid(mapping, f, item, model, depth + 1)
        : !f.required;
    })
  );
}
function resolveBinding(
  binding: Binding,
  scope: Scope,
  model: Model,
  depth = 0,
): Json | undefined {
  if (depth > pathLimit || !bindingShape(binding)) return;
  const result = resolvePath(bindingSource(binding), scope, model);
  if (!result) return;
  if (typeof binding === 'string') {
    if (
      result.field.type === 'array' &&
      result.field.of.type === 'reference' &&
      Array.isArray(result.value)
    ) {
      const of = result.field.of;
      return result.value.map((id) => ({
        ...(itemScope(of, id, model)?.values ?? {}),
        _rowId: String(id),
      }));
    }
    return result.value;
  }
  const field = result.field;
  if (
    !Array.isArray(result.value) ||
    (field.type !== 'array' && field.type !== 'list')
  )
    return;
  return result.value.map((row, i) => {
    const item =
      field.type === 'array'
        ? itemScope(field.of, row, model)
        : { fields: field.fields, values: isRecord(row) ? row : {} };
    if (!item) return {};
    return {
      _rowId: isRecord(row) ? String(row._rowId ?? i) : String(row),
      ...Object.fromEntries(
        Object.entries(binding.fields).map(([key, projection]) => [
          key,
          resolveBinding(projection, item, model, depth + 1) ?? null,
        ]),
      ),
    };
  });
}
// Empty values use literal fallbacks; false and zero are content.
export function resolveBlock(
  block: Block,
  values: Values,
  model: Model = emptyModel,
  fields?: Field[],
): Block {
  const props = { ...block.props };
  for (const [key, binding] of Object.entries(block.bindings ?? {})) {
    const value = fields
      ? resolveBinding(binding, { fields, values }, model)
      : typeof binding === 'string'
        ? binding
            .split('.')
            .reduce<Json | undefined>(
              (v, part) => (isRecord(v) ? v[part] : undefined),
              values,
            )
        : undefined;
    const empty =
      value == null ||
      (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && value.length === 0);
    props[key] = empty ? (props[key] ?? null) : value;
  }
  return { ...block, props };
}
export function bindingPlaceholders(block: Block) {
  return Object.fromEntries(
    Object.entries(block.bindings ?? {}).map(([key, binding]) => [
      key,
      `{{${bindingSource(binding)}}}`,
    ]),
  );
}
