// Fixed camera coordinates measured from the owner captures. The native
// Wayfinder curve, arrowhead, radial glow, and seeded-star formulas are retained.
// No event handlers or camera controls. The viewport follows its owning pane.
const positions = {
  spaces: [
    [319.55, 169.2],
    [320.1, 106.7],
    [266.9, 194.1],
    [231.65, 115.3],
    [184.75, 189.65],
    [177.8, 150.45],
    [51.4, 154.5],
    [165.65, 253.7],
    [131.05, 100.1],
  ],
  tabs: [
    [366.25, 156.55],
    [368.05, 91.6],
    [318.35, 179.1],
    [281.05, 102.65],
    [231.15, 176.3],
    [227.1, 135],
    [102.95, 140.2],
    [213.7, 241.3],
    [177.85, 85.9],
  ],
};
const titles = [
  'The server-side filter…',
  'The rate date and…',
  'The full column set…',
  'The download route…',
  'The Export page UI',
  'CSV encoding correctne…',
  'Docs and architecture…',
  'Test strategy',
  'The live-preview…',
];
const edges = [
  [2, 3],
  [1, 4],
  [1, 5],
  [3, 5],
  [3, 6],
  [4, 7],
  [5, 7],
  [9, 7],
  [1, 8],
  [3, 8],
  [6, 8],
  [2, 9],
  [4, 9],
  [5, 9],
];
function curvePaths(a, b) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    len = Math.hypot(dx, dy) || 1;
  const bow = Math.min(23, len * 0.13),
    cx = (a[0] + b[0]) / 2 - (dy / len) * bow,
    cy = (a[1] + b[1]) / 2 + (dx / len) * bow;
  const mx = 0.25 * a[0] + 0.5 * cx + 0.25 * b[0],
    my = 0.25 * a[1] + 0.5 * cy + 0.25 * b[1],
    ux = dx / len,
    uy = dy / len;
  const tx = mx + ux * 1.75,
    ty = my + uy * 1.75;
  return [
    `M${a}Q${cx},${cy} ${b}`,
    `M${tx},${ty}l${-ux * 3.5 - uy * 1.9},${-uy * 3.5 + ux * 1.9}l${uy * 3.8},${-ux * 3.8}Z`,
  ];
}
function curve(a, b) {
  const [line, arrow] = curvePaths(a, b);
  return `<path d="${line}" fill="none" stroke="rgba(160,192,166,.62)" stroke-width=".9"/><path d="${arrow}" fill="#aecdb6"/>`;
}
function starfield(width, height) {
  let seed = 9001,
    result = '';
  const random = () => {
    seed += 0x6d2b79f5;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  for (const [count, size, alpha] of [
    [140, 0.35, 0.45],
    [80, 0.55, 0.65],
    [34, 0.85, 0.9],
  ]) {
    for (let i = 0; i < count; i++) {
      const x = random() * width,
        y = random() * height,
        t = random();
      result += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${size}" height="${size}" fill="white" opacity="${(alpha * (0.65 + 0.35 * Math.sin(t * 6.2831853))).toFixed(3)}"/>`;
    }
  }
  return result;
}
export function starMap(view, prefix = 'demo') {
  const points = positions[view] || positions.spaces,
    width = view === 'tabs' ? 461.5 : 363.5,
    height = view === 'tabs' ? 270.5 : 298.5;
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Export to CSV map, nine resolved tickets. Ticket 06 is selected."><defs><radialGradient id="${prefix}-star-glow"><stop stop-color="#5b9077" stop-opacity=".85"/><stop offset=".4" stop-color="#5b9077" stop-opacity=".22"/><stop offset="1" stop-color="#5b9077" stop-opacity="0"/></radialGradient><radialGradient id="${prefix}-star-core"><stop stop-color="#b9d6c4"/><stop offset=".6" stop-color="#b9d6c4" stop-opacity=".92"/><stop offset=".82" stop-color="#b9d6c4" stop-opacity=".45"/><stop offset="1" stop-color="#b9d6c4" stop-opacity="0"/></radialGradient></defs>${starfield(width, height)}${edges.map(([a, b]) => curve(points[a - 1], points[b - 1])).join('')}${points.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="12" fill="url(#${prefix}-star-glow)"/><circle cx="${x}" cy="${y}" r="4" fill="url(#${prefix}-star-core)"/>${i === 5 ? `<circle cx="${x}" cy="${y}" r="9.8" fill="none" stroke="rgba(255,255,255,.85)" stroke-width=".75"/>` : ''}`).join('')}</svg>${points.map(([x, y], i) => `<span class="demo-map-label ${i === 5 ? 'is-selected' : ''}" style="left:${x}px;top:${y + (i === 5 || i === 8 ? -23 : i === 4 ? -22 : 5)}px" aria-hidden="true">${String(i + 1).padStart(2, '0')}  ${titles[i]}</span>`).join('')}`;
}

// Keep the same SVG nodes and HTML labels while the workspace changes width.
// Interpolate the two captured camera layouts; text/glyphs are never scaled.
export function mountStarMap(element, prefix) {
  element.innerHTML = starMap('spaces', prefix);
  const svg = element.querySelector('svg');
  const paths = [...svg.querySelectorAll(':scope > path')];
  const circles = [...svg.querySelectorAll(':scope > circle')];
  const labels = [...element.querySelectorAll('.demo-map-label')];
  const stars = [...svg.querySelectorAll('rect')].map((node) => ({
    node,
    x: Number(node.getAttribute('x')) / 363.5,
    y: Number(node.getAttribute('y')) / 298.5,
  }));
  let previous = 0;
  return (tabs) => {
    if (tabs === previous) return;
    previous = tabs;
    const width = 363.5 + 98 * tabs,
      height = 298.5 - 28 * tabs;
    const points = positions.spaces.map((point, i) =>
      point.map((value, j) => value + (positions.tabs[i][j] - value) * tabs),
    );
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    for (const { node, x, y } of stars) {
      node.setAttribute('x', (x * width).toFixed(2));
      node.setAttribute('y', (y * height).toFixed(2));
    }
    edges.forEach(([a, b], i) =>
      curvePaths(points[a - 1], points[b - 1]).forEach((path, j) =>
        paths[2 * i + j].setAttribute('d', path),
      ),
    );
    let circle = 0;
    points.forEach(([x, y], i) => {
      for (let n = 0; n < (i === 5 ? 3 : 2); n++) {
        circles[circle].setAttribute('cx', x);
        circles[circle++].setAttribute('cy', y);
      }
      labels[i].style.left = `${x}px`;
      labels[i].style.top =
        `${y + (i === 5 || i === 8 ? -23 : i === 4 ? -22 : 5)}px`;
    });
  };
}
