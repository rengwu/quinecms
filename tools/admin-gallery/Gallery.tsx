import { useRef, useState } from 'react';
import {
  AdminThemeContext,
  adminThemeKey,
  readAdminMode,
  type AdminMode,
} from '../../src/editor/AdminTheme';
import { ModelContext } from '../../src/editor/ModelContext';
import { LanguageContext } from '../../src/editor/Languages';
import editor from '../../src/editor/editor.module.css';
import { SpecimenCard, type Section } from './Specimen';
import { content } from './content';
import foundations from './specimens/foundations';
import primitives from './specimens/primitives';
import fields from './specimens/fields';
import components from './specimens/components';
import overlays from './specimens/overlays';
import screens from './specimens/screens';
import css from './gallery.module.css';
import { PortalProvider } from '../../src/editor/ui';

export const sections: Section[] = [
  foundations,
  primitives,
  fields,
  components,
  overlays,
  screens,
];

export default function Gallery() {
  const [mode, updateMode] = useState(readAdminMode);
  const portal = useRef<HTMLDivElement>(null);
  function setMode(next: AdminMode) {
    updateMode(next);
    // Shared with the real editor in screen frames.
    try {
      localStorage.setItem(adminThemeKey, next);
    } catch {}
  }
  return (
    <AdminThemeContext.Provider value={{ mode, setMode }}>
      <div className={css.page} data-mode={mode}>
        <header className={css.bar}>
          <h1>Admin gallery</h1>
          <nav aria-label="Sections">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.title}
              </a>
            ))}
          </nav>
          <div role="group" aria-label="Theme" className={css.picker}>
            {(['dark', 'light'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
              >
                {option === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </header>
        <div
          ref={portal}
          className={`admin-ui ${editor.portal}`}
          data-mode={mode}
        />
        <PortalProvider container={portal}>
          <ModelContext.Provider value={content}>
            <LanguageContext.Provider
              value={{ main: 'en', language: 'en', enabled: true }}
            >
              <main>
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className={css.section}
                    aria-labelledby={`${section.id}-title`}
                  >
                    <h2 id={`${section.id}-title`}>{section.title}</h2>
                    <div className={css.grid}>
                      {section.specimens.map((specimen) => (
                        <SpecimenCard
                          key={specimen.title}
                          specimen={specimen}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </main>
            </LanguageContext.Provider>
          </ModelContext.Provider>
        </PortalProvider>
      </div>
    </AdminThemeContext.Provider>
  );
}
