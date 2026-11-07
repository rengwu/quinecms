// Pseudo-classes cannot be set from script. Copy each rule that uses one,
// in place, so it also matches inside [data-gallery-force~="state"]. The copy
// keeps the original media query, layer and specificity.
export type Interaction = 'hover' | 'focus' | 'active';
const patterns: [Interaction, RegExp][] = [
  ['hover', /:hover(?![\w-])/g],
  ['focus', /:focus(?:-visible|-within)?(?![\w-])/g],
  ['active', /:active(?![\w-])/g],
];
const forced = (state: Interaction) =>
  `:is([data-gallery-force~="${state}"], [data-gallery-force~="${state}"] *)`;

function copyRules(parent: CSSStyleSheet | CSSGroupingRule) {
  for (let i = 0; i < parent.cssRules.length; i++) {
    const rule = parent.cssRules[i];
    if (rule instanceof CSSStyleRule) {
      const selector = rule.selectorText;
      if (selector.includes('data-gallery-force')) continue;
      let copy = selector;
      for (const [state, pattern] of patterns)
        copy = copy.replace(pattern, forced(state));
      if (copy === selector) continue;
      try {
        parent.insertRule(`${copy}{${rule.style.cssText}}`, i + 1);
        i++;
      } catch {
        // Pseudo-element states such as ::-webkit-scrollbar-thumb:hover.
      }
    } else if (rule instanceof CSSGroupingRule) copyRules(rule);
  }
}

const done = new WeakSet<CSSStyleSheet>();
function copySheets() {
  for (const sheet of document.styleSheets) {
    if (done.has(sheet)) continue;
    done.add(sheet);
    try {
      copyRules(sheet);
    } catch {
      // Cross-origin sheets are not readable.
    }
  }
}

/** Vite replaces a style element's sheet on every CSS update. */
export function forceStates() {
  copySheets();
  new MutationObserver(copySheets).observe(document.head, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}
