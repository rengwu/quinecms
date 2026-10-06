import { Shell, Intro, Image, text, href, type LayoutProps } from './shared';
export default function Blog(v: LayoutProps) {
  const entries =
    v.context.collections
      ?.find((c) => c.id === v.props.collection)
      ?.entries.slice(0, Number(v.props.limit) || 6) ?? [];
  return (
    <Shell category="blog" variant={v.variant}>
      <Intro {...v} />
      <div className="tw-posts">
        {entries.map((entry) => {
          const p = entry.values ?? {};
          const title = text(p[text(v.props.titleField)]) || entry.title;
          return (
            <article key={entry.id}>
              <Image value={p[text(v.props.imageField)]} context={v.context} />
              <div>
                {p[text(v.props.dateField)] && (
                  <time>{text(p[text(v.props.dateField)])}</time>
                )}
                <h3>
                  {entry.url ? <a href={href(entry.url)}>{title}</a> : title}
                </h3>
                <p>{text(p[text(v.props.summaryField)])}</p>
                {entry.url && (
                  <a className="tw-link" href={href(entry.url)}>
                    Read story ↗
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
      {!entries.length && <p className="tw-empty">No stories yet.</p>}
    </Shell>
  );
}
