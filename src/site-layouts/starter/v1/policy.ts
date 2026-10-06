import type { Content, Site, Values } from '../../../core/types';
import type { LayoutPolicy } from '../../../core/layout-contract';
import { headerFields } from '../../../core/header';
import { resolveLink, object, blank } from '../../../core/content';
import {
  validSiteFont,
  validBodyFontSize,
  validBodyLineHeight,
} from '../../../core/site-style';

export function starterContent(content: Content, settings: Values): Content {
  return {
    ...content,
    site: {
      ...content.site,
      title: String(settings.title ?? ''),
      navigation: (settings.navigation ?? []) as unknown as Site['navigation'],
      header: settings.header as Values | undefined,
      footer: settings.footer as unknown as Site['footer'],
    },
  };
}
const policy: LayoutPolicy = {
  title: (settings) => String(settings.title ?? ''),
  globals: ({
    title: _title,
    header: _header,
    footer: _footer,
    navigation: _nav,
    ...appearance
  }) => appearance,
  validate(settings, content, { fields, blocks, add }) {
    const legacy = !content.site.layout;
    const path = legacy ? 'site' : 'site.layout.settings';
    const view = starterContent(content, settings);
    if (
      typeof settings.title !== 'string' ||
      !Array.isArray(settings.navigation ?? [])
    ) {
      add(path, 'Invalid starter layout settings.');
    }
    if (blank(settings.title)) add(path, 'Site title is required.', 'publish');
    if (settings.header === undefined) {
      for (const n of view.site.navigation ?? []) {
        if (
          !object(n) ||
          typeof n.label !== 'string' ||
          !object(n.to) ||
          !resolveLink(content, n.to)
        )
          add(
            legacy ? 'navigation' : `${path}.navigation`,
            'A navigation link is invalid or missing.',
            'publish',
          );
      }
    } else {
      fields(headerFields, settings.header as Values, `${path}.header`);
      if (object(settings.header)) {
        const header = settings.header as Values;
        for (const item of Array.isArray(header.items)
          ? (header.items as Values[])
          : []) {
          if (
            object(item) &&
            blank(item.url) &&
            (!Array.isArray(item.links) || !item.links.length)
          )
            add(
              `${path}.header`,
              'Navigation items need a URL or dropdown links.',
              'publish',
            );
        }
        if (!blank(header.actionLabel) && blank(header.actionURL))
          add(`${path}.header`, 'The header action needs a URL.', 'publish');
      }
    }
    if (settings.footer !== undefined)
      blocks(
        [settings.footer as unknown as NonNullable<Site['footer']>],
        `${path}.footer`,
        'static',
        'footer',
      );
    const rules: [string, (v: unknown) => boolean, string][] = [
      ['bodyFont', validSiteFont, 'Choose a supported body font.'],
      ['headingFont', validSiteFont, 'Choose a supported heading font.'],
      [
        'bodyFontSize',
        validBodyFontSize,
        'Body font size must be a positive number in pixels.',
      ],
      [
        'bodyLineHeight',
        validBodyLineHeight,
        'Body line height must be a positive number.',
      ],
    ];
    for (const [key, valid, message] of rules) {
      if (settings[key] != null && !valid(settings[key]))
        add(`${legacy ? 'site.globals' : path}.${key}`, message);
    }
    if (
      settings.theme != null &&
      !['light', 'dark'].includes(String(settings.theme))
    )
      add(`${path}.theme`, 'Choose light or dark.');
  },
};
export default policy;
