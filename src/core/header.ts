import type { Content, Field, Values } from './types';
import { resolveLink } from './content';
export const headerFields: Field[] = [
  { key: 'brand', label: 'Brand name', type: 'text' },
  { key: 'logo', label: 'Logo', type: 'media' },
  {
    key: 'items',
    label: 'Navigation',
    type: 'list',
    fields: [
      { key: 'label', label: 'Label', type: 'text', required: true },
      { key: 'url', label: 'URL', type: 'url' },
      {
        key: 'links',
        label: 'Dropdown links',
        type: 'list',
        fields: [
          { key: 'label', label: 'Label', type: 'text', required: true },
          { key: 'url', label: 'URL', type: 'url', required: true },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'group', label: 'Group heading', type: 'text' },
        ],
      },
    ],
  },
  { key: 'actionLabel', label: 'Action label', type: 'text' },
  { key: 'actionURL', label: 'Action URL', type: 'url' },
];
export function headerValues(content: Content): Values {
  return (
    content.site.header ?? {
      brand: content.site.title,
      items: content.site.navigation.map((n) => ({
        _rowId: n.id,
        label: n.label,
        url: resolveLink(content, n.to) ?? '',
        links: [],
      })),
    }
  );
}
