import { createElement, useState } from 'react';
export default function View({ props, context }: any) {
  const [count, setCount] = useState(Number(props?.start ?? 0));
  return createElement(
    'section',
    null,
    createElement('h1', null, String(props?.title ?? props?.heading ?? '')),
    props?.body ? createElement('p', null, String(props.body)) : null,
    props?.start !== undefined
      ? createElement(
          'button',
          { onClick: () => setCount(count + 1) },
          String(count),
        )
      : null,
  );
}
