import postcss from 'postcss';

// Kumo's standalone stylesheet includes a reset. Keep it and its utilities
// inside the editor controls/portals, never the sibling live block preview.
export function scopeKumoStyles(css) {
  const root = postcss.parse(css);
  root.walkRules((rule) => {
    for (let parent = rule.parent; parent; parent = parent.parent) {
      if (parent.type === 'atrule' && /keyframes$/.test(parent.name)) return;
    }
    rule.selectors = rule.selectors.map((selector) => {
      const scoped = selector.replace(/:root\b|:host\b|^html\b/g, '.kumo-ui');
      if (scoped.includes('.kumo-ui')) return scoped;
      if (/^\[data-(?:mode|theme)[=\]]/.test(scoped))
        return '.kumo-ui' + scoped;
      return ':where(.kumo-ui) ' + scoped;
    });
  });
  return root.toString();
}

export function kumoStyles() {
  return {
    name: 'editor-kumo-styles',
    enforce: 'pre',
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/styles/kumo-standalone.css')) return;
      return { code: scopeKumoStyles(code), map: null };
    },
  };
}
