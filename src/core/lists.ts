import type { Field, Json, Values } from './types';
import {
  emptyModel,
  isRecord,
  objectFields,
  rowFields,
  type Model,
} from './schema';
export function rowId() {
  return 'row_' + crypto.randomUUID();
}
export function listRows(value: unknown): Values[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}
export function fieldDefaults(
  fields: Field[],
  model: Model = emptyModel,
  depth = 0,
): Values {
  if (depth > 3) return {};
  return Object.fromEntries(
    fields.map((f) => [
      f.key,
      normalizeLists(
        f,
        structuredClone(
          f.default ??
            (f.type === 'list' || f.type === 'array'
              ? []
              : f.type === 'object'
                ? {}
                : null),
        ),
        model,
        depth,
      ),
    ]),
  );
}
// Used when creating or duplicating values, never when reordering existing rows.
export function normalizeLists(
  field: Field,
  value: Json,
  model: Model = emptyModel,
  depth = 0,
): Json {
  if (depth > 3) return value;
  if (field.type === 'object' && isRecord(value))
    return {
      ...value,
      ...Object.fromEntries(
        objectFields(field, model).map((f) => [
          f.key,
          normalizeLists(
            f,
            structuredClone(
              value[f.key] ??
                f.default ??
                (f.type === 'object'
                  ? {}
                  : f.type === 'array' || f.type === 'list'
                    ? []
                    : null),
            ),
            model,
            depth + 1,
          ),
        ]),
      ),
    };
  const fields = rowFields(field, model);
  if (!fields || !Array.isArray(value)) return value;
  return listRows(value).map((row) => ({
    ...fieldDefaults(fields, model, depth + 1),
    ...row,
    _rowId: rowId(),
    ...Object.fromEntries(
      fields.map((f) => [
        f.key,
        normalizeLists(
          f,
          structuredClone(
            row[f.key] ??
              f.default ??
              (f.type === 'object'
                ? {}
                : f.type === 'array' || f.type === 'list'
                  ? []
                  : null),
          ),
          model,
          depth + 1,
        ),
      ]),
    ),
  }));
}
