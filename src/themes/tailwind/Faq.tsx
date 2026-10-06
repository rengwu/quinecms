import {
  Shell,
  Intro,
  Items,
  Rich,
  key,
  text,
  type LayoutProps,
} from './shared';
export default function Faq(v: LayoutProps) {
  return (
    <Shell category="faq" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-questions">
        <Items {...v}>
          {(r, i) =>
            v.variant === 3 ? (
              <article key={key(r, i)}>
                <h3>{text(r.question)}</h3>
                <Rich value={r.answer} context={v.context} />
              </article>
            ) : (
              <details key={key(r, i)}>
                <summary>
                  {text(r.question)}
                  <span aria-hidden="true">+</span>
                </summary>
                <Rich value={r.answer} context={v.context} />
              </details>
            )
          }
        </Items>
      </div>
    </Shell>
  );
}
