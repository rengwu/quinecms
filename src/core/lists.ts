import type { Field, Json, Values } from './types';

export function rowId() {
  return 'row_' + crypto.randomUUID();
}
export function listRows(value: unknown): Values[] {
  return Array.isArray(value)
    ? value.filter(
        (v): v is Values => !!v && typeof v === 'object' && !Array.isArray(v),
      )
    : [];
}
export function fieldDefaults(fields: Field[]): Values {
  return Object.fromEntries(
    fields.map((f) => [
      f.key,
      normalizeLists(
        f,
        structuredClone(f.default ?? (f.type === 'list' ? [] : null)),
      ),
    ]),
  );
}
export function normalizeLists(field: Field, value: Json): Json {
  if (field.type !== 'list' || !Array.isArray(value)) return value;
  return listRows(value).map((row) => ({
    ...row,
    _rowId: rowId(),
    ...Object.fromEntries(
      field.fields.map((f) => [
        f.key,
        normalizeLists(f, row[f.key] ?? f.default ?? null),
      ]),
    ),
  }));
}
