import type { ViewProps } from '../../../core/types';
import { anchor, image, text } from '../../../themes/quine/v1/content';
import Halftone from '../../../themes/quine/v1/Halftone';
import '../../../themes/quine/v1/styles.css';
export default function Statement({ props, context }: ViewProps) {
  return (
    <section
      className="quine-scope quine-section quine-statement"
      id={anchor(props.anchor)}
    >
      <div className="quine-frame">
        <div className="quine-statement-card">
          <Halftone src={image(props.image, context)?.url} />
          <div className="quine-statement-copy">
            <p className="quine-caption">{text(props.eyebrow)}</p>
            <h2 className="quine-heading">{text(props.heading)}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
