import {
  Shell,
  rows,
  text,
  href,
  key,
  Image,
  type LayoutProps,
} from './shared';
export default function Footer(v: LayoutProps) {
  const p = v.props;
  return (
    <footer>
      <Shell category="footer" variant={v.variant}>
        <div className="tw-footer-top">
          <div className="tw-mission">
            <Image value={p.logo} context={v.context} art={false} />
            <strong>{text(p.brand)}</strong>
            {v.variant === 3 && <p>{text(p.description)}</p>}
          </div>
          <nav aria-label="Footer">
            {rows(p.columns).map((col, i) => (
              <div key={key(col, i)}>
                <h3>{text(col.title)}</h3>
                <ul>
                  {rows(col.links).map((link, j) => (
                    <li key={key(link, j)}>
                      <a href={href(link.url)}>{text(link.label)}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="tw-footer-bottom">
          <small>{text(p.copyright)}</small>
          <div>
            {rows(p.socials).map((r, i) => (
              <a key={key(r, i)} href={href(r.url)}>
                {text(r.label)}
              </a>
            ))}
          </div>
        </div>
      </Shell>
    </footer>
  );
}
