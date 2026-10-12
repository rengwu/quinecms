import type { ViewProps } from '../../../core/types';
import { text } from '../../../themes/quine/v1/content';
import { Action, Wordmark } from '../../../themes/quine/v1/components';
export default function Hero({ props }: ViewProps) {
  return (
    <section className="quine-scope quine-section quine-hero">
      <div className="quine-frame">
        <Wordmark value={text(props.brand)} animated />
        <div className="quine-intro">
          <p className="quine-caption">{text(props.eyebrow)}</p>
          <h1 className="quine-heading">{text(props.heading)}</h1>
          <p className="quine-body">{text(props.body)}</p>
          <div className="quine-actions">
            {props.primaryLabel && (
              <Action url={props.primaryURL} outline>
                {text(props.primaryLabel)}
              </Action>
            )}
            {props.secondaryLabel && (
              <Action url={props.secondaryURL} arrow>
                {text(props.secondaryLabel)}
              </Action>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
