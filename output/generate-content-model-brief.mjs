import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';

const directory = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(directory, '../docs/wiki/discussions/content-model-plan.md');
const markdown = fs.readFileSync(source, 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
const sections = markdown.split(/^## /m).slice(1).map((section) => {
  const end = section.indexOf('\n');
  return { title: section.slice(0, end), body: section.slice(end + 1) };
});
function render(body) {
  const html = marked.parse(body).replace(/href="([^"]+)"/g, (match, href) => {
    if (/^(https?:|#)/.test(href)) return match;
    const target = path.resolve(path.dirname(source), href);
    return `href="${path.relative(directory, target)}"`;
  });
  const document = new JSDOM(html).window.document;
  for (const table of document.querySelectorAll('table')) {
    const headings = [...table.querySelectorAll('th')].map(node => node.textContent);
    table.dataset.columns = String(headings.length);
    for (const row of table.querySelectorAll('tbody tr')) {
      [...row.querySelectorAll('td')].forEach((cell, index) => cell.dataset.label = headings[index]);
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    table.replaceWith(wrapper);
    wrapper.append(table);
  }
  return document.body.innerHTML;
}
const details = sections.map(({ title, body }, index) => `<details id="detail-${index}"><summary><span>${title}</span><span class="plus" aria-hidden="true">+</span></summary><div class="detail-body">${render(body)}</div></details>`).join('\n');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Collections, objects & relations — the agreed design</title><style>
:root{color-scheme:light;--ink:#20372f;--muted:#617269;--line:#d7e0d5;--paper:#fafbf7;--green:#164b3c;--lime:#d9e6a8}*{box-sizing:border-box}body{margin:0;background:#edf1e9;color:var(--ink);font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1100px;margin:40px auto;padding:0 28px 32px}header{background:var(--green);color:#f8faf1;padding:40px 44px;border-radius:20px}header .eyebrow{color:#c4d7bb}.eyebrow{font-size:11px;line-height:1.4;letter-spacing:1.5px;font-weight:750;text-transform:uppercase}h1{font-size:clamp(32px,5vw,52px);line-height:1.08;letter-spacing:-1.8px;margin:16px 0 18px;font-weight:700;max-width:780px}header p{max-width:660px;color:#e0ebdc;margin:0 0 20px}header .status{display:inline-block;border:1px solid #567763;padding:6px 12px;border-radius:20px;font-size:12px;color:#e4eedb}a{color:var(--green);text-underline-offset:3px}h2{font-size:23px;line-height:1.25;letter-spacing:-.5px;margin:0 0 14px}h3{font-size:21px;margin:11px 0 9px;letter-spacing:-.4px}p{margin:10px 0}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:20px 0}.card{border:1px solid var(--line);background:var(--paper);border-radius:15px;padding:25px 24px}.number{display:inline-grid;place-items:center;width:27px;height:27px;background:#e7eddf;border-radius:8px;color:#4d6654;font:600 11px/1 ui-monospace,monospace}.card p{font-size:14px;line-height:1.65;color:var(--muted)}.card .example{border-top:1px solid var(--line);padding-top:13px;margin:15px 0 0;color:#304d40;font-size:12px}.split{display:grid;grid-template-columns:1.05fr 1fr;gap:18px;margin:20px 0}.panel{background:var(--paper);border:1px solid var(--line);border-radius:15px;padding:27px 28px}.panel ul{padding-left:20px;margin:12px 0 0}.panel li{font-size:14px;line-height:1.65;margin:9px 0}.panel p{font-size:14px;color:var(--muted)}.limit{background:#e5ebdd}.label{font-size:10px;letter-spacing:1px;font-weight:750;color:var(--muted);text-transform:uppercase;margin:0 0 10px}.last{margin:25px 0 8px}.last h2{margin-bottom:7px}.last p{font-size:14px;color:var(--muted);max-width:800px}.choices{display:flex;gap:8px;flex-wrap:wrap;margin:13px 0 0}.choices span{display:inline-flex;border:1px solid #cbd8c1;background:#f6f9ee;padding:7px 11px;border-radius:8px;font-size:12px;font-weight:600}.details-header{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin:34px 2px 16px}.details-header h2{margin:0}.details-header span{font-size:12px;color:var(--muted)}details{background:var(--paper);border:1px solid var(--line);border-radius:12px;margin:9px 0;overflow:hidden}summary{display:flex;align-items:center;justify-content:space-between;gap:15px;cursor:pointer;list-style:none;font-size:15px;font-weight:650;padding:18px 23px}summary::-webkit-details-marker{display:none}.plus{font-size:22px;line-height:1;color:#668365;font-weight:400;flex-shrink:0}details[open] .plus{transform:rotate(45deg)}.detail-body{padding:5px 24px 22px;border-top:1px solid var(--line);font-size:14px}.detail-body p{margin:15px 0}.detail-body a{overflow-wrap:anywhere}pre{background:#eaf0e5;padding:18px;border-radius:9px;overflow:auto;font:12px/1.7 ui-monospace,SFMono-Regular,Consolas,monospace;margin:15px 0}.schema{margin-bottom:0;font-size:12px;line-height:1.8;padding:15px 18px}code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.9em;overflow-wrap:anywhere}.table-scroll{overflow:auto;border:1px solid var(--line);border-radius:9px;margin:18px 0}table{width:100%;border-collapse:collapse;text-align:left;font-size:13px;line-height:1.6}td,th{padding:12px 14px;vertical-align:top;border-bottom:1px solid var(--line)}th{font-size:11px;background:#eaf0e4}tr:last-child td{border-bottom:0}td:first-child{width:25%;font-weight:600}footer{display:flex;justify-content:space-between;gap:20px;padding:23px 3px 0;font-size:12px;color:var(--muted)}footer p{margin:0}button{font:inherit}:focus-visible{outline:3px solid #94ac50;outline-offset:4px}@media(max-width:680px){main{margin:12px auto;padding:0 12px 24px}header{padding:29px 25px;border-radius:16px}h1{letter-spacing:-1px}.cards{grid-template-columns:1fr;gap:10px}.card{padding:19px 22px}.card h3{display:inline-block;margin:0 0 0 9px;font-size:19px}.card p{margin:11px 0 0}.card .example{margin-top:12px;padding-top:10px}.split{grid-template-columns:1fr;gap:12px}.panel{padding:23px}.details-header{display:block}.details-header span{display:block;margin-top:6px}summary{font-size:14px;padding:17px 20px}.detail-body{padding:3px 19px 18px}.table-scroll table{min-width:570px}footer{display:block}footer p+p{margin-top:10px}header p{font-size:15px}h2{font-size:21px}}@media(prefers-reduced-motion:no-preference){.plus{transition:transform .15s ease}}@media print{body{background:white}main{margin:0;max-width:none}header{background:#e5ebdd;color:#163f31}header p,header .eyebrow,header .status{color:#163f31}.cards,.panel{break-inside:avoid}details{break-inside:auto}.detail-body{display:block}footer{display:block}}
@media(max-width:680px){.table-scroll table{min-width:0;display:block}.table-scroll thead{display:none}.table-scroll tbody{display:block}.table-scroll tr{display:block;padding:10px 0;border-bottom:1px solid var(--line)}.table-scroll tr:last-child{border-bottom:0}.table-scroll td{display:block;width:auto;padding:4px 14px;border:0}.table-scroll td:first-child{font-size:14px}.table-scroll table[data-columns="3"] td:not(:first-child)::before{content:attr(data-label);display:block;font-size:10px;letter-spacing:.6px;text-transform:uppercase;font-weight:700;color:var(--muted);margin-top:6px}}
</style></head><body><main>
<header><div class="eyebrow">QuineCMS · Content model · 07 October 2026</div><h1>Collections, objects<br>& relations.</h1><p>The agreed design, the tradeoffs we’re choosing, and a concrete plan for building it.</p><span class="status">Design agreed · Implementation not started</span></header>
<div class="cards" aria-label="Three building blocks">
<article class="card"><span class="number">01</span><h3>Collections</h3><p>Own their entries and complete schemas. Hold many records, or one record such as Company Profile.</p><p class="example">Articles, People, Projects</p></article>
<article class="card"><span class="number">02</span><h3>Objects</h3><p>Group fields inline or through a reusable definition. Share the structure; each entry keeps its own values.</p><p class="example">SEO, Address, Contact details</p></article>
<article class="card"><span class="number">03</span><h3>Relations</h3><p>Connect independent entries. Select one or several from one collection, with editorial ordering.</p><p class="example">Article → Author · Project → People</p></article>
</div>
<section class="last"><h2>Your final choices</h2><p>You delegated the leanest approach for usage and linked editing, and selected one Schemas area.</p><div class="choices"><span>Reverse lookup: admin usage only</span><span>Relations: select existing entries</span><span>Schemas → Collections / Objects</span></div></section>
<div class="split">
<section class="panel"><div class="label">What this enables</div><h2>Shared content, independent pages.</h2><p>Authors can exist without URLs. Articles can generate pages. A single Company Profile can live at <code>/about</code>.</p><pre class="schema">Article
  title: text
  seo: SEO object
  author: reference → Authors
  related: ordered references → Articles</pre></section>
<section class="panel limit"><div class="label">The boundaries we chose</div><h2>Flexible within clear limits.</h2><ul><li>Objects and list rows stay <strong>one level deep</strong>; each list has one shape.</li><li>No mixed-collection relations or automatic reverse template lists.</li><li>Related entries are created and edited separately through Content.</li></ul><p>Deeply nested content, richer page composition and large-site scaling still need later work.</p></section>
</div>
<div class="details-header"><h2>The complete brief</h2><span>Expand a section · Engineering details are proposals</span></div>
${details}
<footer><p>16 product choices recorded · DEC-110–DEC-125<br>Markdown is authoritative. No application code changed.</p><p><a href="../docs/wiki/index.html">Project wiki ↗</a> &nbsp; <a href="cms-objects-relations-brief.html">Earlier CMS research ↗</a></p></footer>
</main></body></html>`;
fs.writeFileSync(path.join(directory, 'collections-schemas-plan.html'), html);
console.log(`Generated collections-schemas-plan.html (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
