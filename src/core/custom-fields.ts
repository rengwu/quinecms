// Block authors register pure validators here. Both the build and editor use them.
export const customValidators: Record<string, (value: unknown) => boolean> = {
  'hero-presentation': (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return false;
    const v = value as Record<string, unknown>;
    return (
      typeof v.accent === 'string' &&
      /^#[a-f\d]{6}$/i.test(v.accent) &&
      typeof v.inset === 'number' &&
      Number.isFinite(v.inset) &&
      v.inset >= 24 &&
      v.inset <= 160
    );
  },
};
