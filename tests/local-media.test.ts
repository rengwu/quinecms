import { expect, it } from 'vitest';
import { fixture } from './support/fixture';
import { filesFor, parseFiles, validate } from '../src/core/content';
import { definitions } from '../src/generated/definitions';

it('round trips copied public assets through the same media records as HTTPS uploads', () => {
  const content = fixture();
  content.media = [
    {
      formatVersion: 1,
      id: 'media_local',
      name: 'Local image',
      original: {
        key: 'photos/original.jpg',
        url: '/photos/original.jpg',
        mime: 'image/jpeg',
        bytes: 10,
      },
      variants: [
        {
          key: 'photos/small.webp',
          url: '/photos/small.webp',
          mime: 'image/webp',
          bytes: 5,
          width: 480,
        },
      ],
    },
  ];
  expect(validate(content, definitions)).toEqual([]);
  expect(parseFiles(filesFor(content))).toEqual(content);
  content.media[0].original.url = 'https://media.example.com/original.jpg';
  expect(validate(content, definitions)).toEqual([]);
  for (const url of [
    '//external.example/x.jpg',
    '/\\external.example/x.jpg',
    'http://external.example/x.jpg',
    'javascript:alert(1)',
    'data:image/png;base64,abc',
    '/bad path.jpg',
    'relative.jpg',
  ]) {
    content.media[0].original.url = url;
    expect(validate(content, definitions)).toContainEqual(
      expect.objectContaining({
        path: 'media_local',
        message: 'Invalid media file metadata.',
      }),
    );
  }
});
