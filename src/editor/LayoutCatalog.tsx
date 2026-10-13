import { useState } from 'react';
import { Button } from '@cloudflare/kumo/components/button';
import { Input } from '@cloudflare/kumo/components/input';
import type { Content, LayoutDefinition, Page } from '../core/types';
import { layoutDefinitions, contentForLayout } from '../core/layouts';
import CatalogHeader from './CatalogHeader';
import LayoutSurface, { PageBlocks } from './LayoutSurface';
import catalog from './layout-catalog.module.css';

export default function LayoutCatalog({
  content,
  page,
  onSelect,
  title,
}: {
  content: Content;
  page?: Page;
  onSelect(definition: LayoutDefinition): void;
  title: string;
}) {
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<LayoutDefinition>();
  const [mobile, setMobile] = useState(false);
  const cards = [...new Set(layoutDefinitions.map((d) => d.id))]
    .map(
      (id) =>
        layoutDefinitions
          .filter((d) => d.id === id)
          .sort(
            (a, b) =>
              Number(!!a.deprecated) - Number(!!b.deprecated) ||
              b.version - a.version,
          )[0],
    )
    .filter((d) =>
      `${d.label} ${d.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );
  const candidate = (design: LayoutDefinition) =>
    contentForLayout(content, {
      id: design.id,
      version: design.version,
      settings: design.defaults,
    });
  return (
    <>
      <CatalogHeader
        title={preview?.label ?? title}
        closeLabel="Close layout library"
      />
      <div className={catalog.library}>
        {preview ? (
          <>
            <div className={catalog.toolbar}>
              <Button onClick={() => setPreview(undefined)}>
                Back to layouts
              </Button>
              <Button onClick={() => setMobile(!mobile)}>
                {mobile ? 'Desktop' : 'Mobile'}
              </Button>
              <Button variant="primary" onClick={() => onSelect(preview)}>
                Use this design
              </Button>
            </div>
            <div className={catalog.preview} data-mobile={mobile}>
              <LayoutSurface content={candidate(preview)}>
                <PageBlocks content={candidate(preview)} page={page} />
              </LayoutSurface>
            </div>
          </>
        ) : (
          <>
            <Input
              aria-label="Search layouts"
              placeholder="Search layouts"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className={catalog.grid}>
              {cards.map((d) => (
                <article key={d.id} className={catalog.card}>
                  <div className={catalog.choice}>
                    <div className={catalog.thumbnail} aria-hidden="true" inert>
                      <div className={catalog.miniature}>
                        <LayoutSurface content={candidate(d)}>
                          <div className={catalog.sample}>
                            <div />
                            <div />
                            <div />
                          </div>
                        </LayoutSurface>
                      </div>
                    </div>
                    <button
                      className={catalog.choose}
                      aria-label={`Use ${d.label} design`}
                      onClick={() => onSelect(d)}
                    >
                      <strong>{d.label}</strong>
                      <span>{d.description}</span>
                    </button>
                  </div>
                  <Button
                    variant="secondary"
                    aria-label={`Preview ${d.label} layout`}
                    onClick={() => {
                      setPreview(d);
                      setMobile(false);
                    }}
                  >
                    Preview
                  </Button>
                </article>
              ))}
            </div>
            {!cards.length && <p>No layouts match your search.</p>}
          </>
        )}
      </div>
    </>
  );
}
