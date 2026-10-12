import type { ViewProps } from '../../../core/types';
import { anchor, href, image, text } from '../../../themes/quine/v1/content';
import { Arrow, Wordmark } from '../../../themes/quine/v1/components';
import Halftone from '../../../themes/quine/v1/Halftone';
export default function Contact({ props, context }: ViewProps) {
  return (
    <section
      className="quine-scope quine-section quine-contact"
      id={anchor(props.anchor)}
    >
      <Halftone src={image(props.image, context)?.url} green />
      <div className="quine-frame quine-contact-frame">
        <div className="quine-contact-line">
          <h2 className="quine-heading">{text(props.heading)}</h2>
          <span className="quine-contact-rule" aria-hidden="true">
            <Arrow />
          </span>
          <a className="quine-contact-link" href={href(props.linkURL)}>
            {text(props.linkLabel)}
            <Arrow diagonal />
          </a>
        </div>
        <Wordmark value={text(props.brand)} />
      </div>
    </section>
  );
}
