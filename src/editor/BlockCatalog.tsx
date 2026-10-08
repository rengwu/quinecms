import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import { Select } from '@cloudflare/kumo/components/select';
import { CaretLeftIcon, CaretRightIcon, PlusIcon } from '@phosphor-icons/react';
import type { Block, Content, Context, Definition } from '../core/types';
import { contextFor } from '../core/content';
import { layoutGlobals } from '../core/layouts';
import { siteStyle } from '../core/site-style';
import { catalogDefinitions, filterCatalog, tagsOf, themeOf } from './catalog';
import Island from './Island';
import styles from './catalog.module.css';

function sample(
  d: Definition,
  content: Content,
): { block: Block; context: Context } {
  const block: Block = {
    id: 'catalog-' + d.type.replaceAll('/', '-'),
    type: d.type,
    version: d.version,
    props: structuredClone(d.defaults),
  };
  const context = { ...contextFor(content, block.id), preview: true };
  if (d.tags?.includes('blog')) {
    block.props = {
      ...block.props,
      collection: 'catalog-stories',
      titleField: 'title',
      summaryField: 'summary',
      dateField: 'date',
    };
    context.collections = [
      {
        id: 'catalog-stories',
        name: 'Sample stories',
        entries: [
          'A new perspective on what comes next',
          'Making room for better ideas',
          'The people behind the progress',
          'Small steps, lasting change',
        ].map((title, i) => ({
          id: 'sample-' + i,
          title,
          url: '#',
          values: {
            title,
            summary:
              'Stories of thoughtful work, shared ambition and meaningful progress.',
            date: '2026-10-06',
          },
        })),
      },
    ];
  }
  return { block, context };
}
function Thumbnail({
  definition,
  content,
}: {
  definition: Definition;
  content: Content;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(0.25);
  const data = useMemo(
    () => sample(definition, content),
    [definition, content],
  );
  useEffect(() => {
    const el = ref.current!;
    if (
      typeof IntersectionObserver === 'undefined' ||
      typeof ResizeObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { rootMargin: '160px' },
    );
    observer.observe(el);
    const resize = new ResizeObserver(() => setScale(el.clientWidth / 1200));
    resize.observe(el);
    return () => {
      observer.disconnect();
      resize.disconnect();
    };
  }, []);
  return (
    <div ref={ref} className={styles.thumbnail} aria-hidden="true" inert>
      {visible && (
        <div
          className={'site-surface ' + styles.scaled}
          data-theme={layoutGlobals(content.site).theme}
          style={
            {
              ...siteStyle(layoutGlobals(content.site)),
              transform: `scale(${scale})`,
            } as CSSProperties
          }
        >
          <Island {...data} />
        </div>
      )}
    </div>
  );
}
export default function BlockCatalog({
  definitions,
  content,
  kind,
  placement = 'page',
  onAdd,
}: {
  definitions: Definition[];
  content: Content;
  kind: 'static' | 'generic';
  placement?: 'page' | 'footer';
  onAdd(d: Definition): void;
}) {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [preview, setPreview] = useState<Definition | null>(null);
  const [mobile, setMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tagScrollRef = useRef<HTMLDivElement>(null);
  const [tagScroll, setTagScroll] = useState({ left: false, right: false });
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [preview]);
  const available = useMemo(
    () => catalogDefinitions(definitions, kind, placement),
    [definitions, kind, placement],
  );
  useEffect(() => {
    const el = tagScrollRef.current;
    if (!el) return;
    const update = () => {
      const left = el.scrollLeft > 1;
      const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 1;
      setTagScroll((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right },
      );
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, [available, preview]);
  function scrollTags(direction: -1 | 1) {
    const el = tagScrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * Math.min(240, el.clientWidth * 0.6),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  }
  const filtered = filterCatalog(available, query, theme, tags);
  const choices = [...new Set(available.flatMap(tagsOf))].sort();
  const data = useMemo(
    () => (preview ? sample(preview, content) : null),
    [preview, content],
  );
  if (preview && data)
    return (
      <div ref={scrollRef} className={styles.catalog}>
        <div className={styles.previewToolbar}>
          <Button variant="ghost" onClick={() => setPreview(null)}>
            ← Back
          </Button>
          <div>
            <strong>{preview.label}</strong>
            <span>{themeOf(preview)} · Sample content</span>
          </div>
          <Button onClick={() => setMobile(!mobile)} aria-pressed={mobile}>
            {mobile ? 'Mobile' : 'Desktop'}
          </Button>
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={() => onAdd(preview)}
          >
            {placement === 'footer' ? 'Add footer' : 'Add block'}
          </Button>
        </div>
        <div className={styles.previewCanvas}>
          <div
            className={'site-surface ' + styles.fullPreview}
            data-mobile={mobile}
            data-theme={layoutGlobals(content.site).theme}
            style={siteStyle(layoutGlobals(content.site)) as CSSProperties}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) e.preventDefault();
            }}
          >
            <Island {...data} />
          </div>
        </div>
      </div>
    );
  return (
    <div ref={scrollRef} className={styles.catalog}>
      <div className={styles.controls}>
        <Input
          aria-label="Search blocks"
          placeholder="Search blocks, themes or tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          className={styles.themeSelect}
          aria-label="Block theme"
          value={theme || 'all'}
          renderValue={(v) => (v === 'all' ? 'All themes' : v)}
          onValueChange={(v) => setTheme(v === 'all' ? '' : (v ?? ''))}
        >
          <Select.Option value="all">All themes</Select.Option>
          {[...new Set(available.map(themeOf))].sort().map((t) => (
            <Select.Option key={t} value={t}>
              {t}
            </Select.Option>
          ))}
        </Select>
        <Button
          className={styles.resetFilters}
          variant="ghost"
          disabled={!(query || theme || tags.length)}
          onClick={() => {
            setQuery('');
            setTheme('');
            setTags([]);
          }}
        >
          Reset filters
        </Button>
      </div>
      <div className={styles.tagBar}>
        <Button
          size="sm"
          shape="square"
          variant="outline"
          aria-label="Scroll tags left"
          disabled={!tagScroll.left}
          onClick={() => scrollTags(-1)}
        >
          <CaretLeftIcon />
        </Button>
        <div
          ref={tagScrollRef}
          className={styles.tags}
          aria-label="Filter by tags"
        >
          {choices.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tags.includes(t) ? 'primary' : 'outline'}
              aria-pressed={tags.includes(t)}
              onClick={() =>
                setTags(
                  tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t],
                )
              }
            >
              {t}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          shape="square"
          variant="outline"
          aria-label="Scroll tags right"
          disabled={!tagScroll.right}
          onClick={() => scrollTags(1)}
        >
          <CaretRightIcon />
        </Button>
      </div>
      <p className={styles.count} role="status">
        {filtered.length} {filtered.length === 1 ? 'block' : 'blocks'}
        {kind === 'generic' ? ' · Supports schema bindings' : ''}
      </p>
      <div className={styles.results}>
        {filtered.map((d) => (
          <article className={styles.card} key={d.type}>
            <div className={styles.visual}>
              <Thumbnail definition={d} content={content} />
              <Button
                className={styles.addOverlay}
                variant="ghost"
                aria-label={`Add ${d.label}`}
                onClick={() => onAdd(d)}
              />
            </div>
            <div className={styles.cardDetails}>
              <div>
                <Button
                  className={styles.cardName}
                  variant="ghost"
                  onClick={() => onAdd(d)}
                >
                  {d.label}
                </Button>
                <span>{themeOf(d)}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                aria-label={`Preview ${d.label}`}
                onClick={() => setPreview(d)}
              >
                Preview
              </Button>
            </div>
          </article>
        ))}
        {!filtered.length && (
          <div className={styles.empty}>
            <h3>No matching blocks</h3>
            <p>Try another name or remove a filter.</p>
            <Button
              onClick={() => {
                setQuery('');
                setTheme('');
                setTags([]);
              }}
            >
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
