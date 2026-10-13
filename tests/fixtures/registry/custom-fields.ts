export const customValidators: Record<string, (value: unknown) => boolean> = {
  'hero-presentation': (value: any) =>
    !!value &&
    typeof value === 'object' &&
    /^#[a-f\d]{6}$/i.test(value.accent) &&
    Number.isFinite(value.inset) &&
    value.inset >= 24 &&
    value.inset <= 160,
};
