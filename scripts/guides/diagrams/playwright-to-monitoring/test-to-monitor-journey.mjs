import { C, head, footer, chip, write } from '../lib.mjs'
const W = 1200, H = 516
const MONO = `'JetBrains Mono', ui-monospace, Menlo, monospace`
let s = head(W, H, 'Every test runs in CI. A few of them become monitors.',
  'Each dot is one Playwright test. Local runs what you touched, CI runs the whole suite, and the tagged flows go on to production.')

let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const stages = [
  { id: '01', title: 'local', sub: 'the tests you are working on', n: 40, color: C.dim, tag: 'npx playwright test', gate: null, count: '40 tests' },
  { id: '02', title: 'ci / staging', sub: 'the whole suite, every pull request', n: 60, color: C.blue, tag: 'project chromium', gate: ['$ git push'], count: '60 tests' },
  { id: '03', title: 'production', sub: 'tagged @monitor, every 10 minutes', n: 12, color: C.green, tag: 'project monitoring', gate: ['$ npx checkly', '  deploy'], count: '12 monitors' },
]
const PW = 310, PH = 300, PY = 112, GAP = 90, X0 = 40
const px = i => X0 + i * (PW + GAP)
const monitorIdx = new Set([3, 7, 14, 18, 22, 27, 33, 38, 41, 46, 52, 57])

stages.forEach((st, i) => {
  const x = px(i)
  // darker panel with a faint dot-matrix background
  s += `<rect x="${x}" y="${PY}" width="${PW}" height="${PH}" rx="12" fill="#03112A" fill-opacity="0.85" stroke="${C.border}"/>\n`
  for (let gy2 = PY + 16; gy2 < PY + PH - 8; gy2 += 12) for (let gx2 = x + 16; gx2 < x + PW - 8; gx2 += 12)
    s += `<circle cx="${gx2}" cy="${gy2}" r="0.8" fill="rgba(139,163,199,0.14)"/>`
  s += '\n'
  // header: mono step id + title
  s += `<text x="${x+22}" y="${PY+34}" font-size="13" font-family="${MONO}" fill="${st.color}" font-weight="500">${st.id}</text>`
  s += `<text x="${x+52}" y="${PY+34}" font-size="16" font-family="${MONO}" font-weight="500">${st.title}</text>`
  s += `<text x="${x+22}" y="${PY+56}" font-size="12" font-family="${MONO}" fill="${C.sec}">// ${st.sub}</text>\n`
  const gx = x + 22, gw = PW - 44, gh = 150, gy = PY + 76 + (i === 0 ? 12 : 0)
  const cols = 10, rows = 6, cw = gw / cols, rh = gh / rows
  if (i === 2) {
    const cols2 = 4, rows2 = 3, cw2 = 60, rh2 = 48
    const ox = gx + (gw - cols2 * cw2) / 2 + cw2 / 2, oy = gy + (gh - rows2 * rh2) / 2 + rh2 / 2
    for (let k = 0; k < st.n; k++) {
      const r = Math.floor(k / cols2), c = k % cols2
      const dx = ox + c * cw2 + (rnd() - 0.5) * 8, dy = oy + r * rh2 + (rnd() - 0.5) * 8
      s += `<circle cx="${dx}" cy="${dy}" r="14" fill="${st.color}" fill-opacity="0.16"/><circle cx="${dx}" cy="${dy}" r="7" fill="${st.color}"/>\n`
    }
  } else {
    for (let k = 0; k < st.n; k++) {
      const r = Math.floor(k / cols), c = k % cols
      const dx = gx + c * cw + cw / 2 + (rnd() - 0.5) * 9, dy = gy + r * rh + rh / 2 + (rnd() - 0.5) * 9
      const rad = 5 + rnd() * 1.5
      const isMon = i === 1 && monitorIdx.has(k)
      s += isMon
        ? `<circle cx="${dx}" cy="${dy}" r="${rad+5}" fill="${C.green}" fill-opacity="0.18"/><circle cx="${dx}" cy="${dy}" r="${rad}" fill="${C.green}"/>\n`
        : `<circle cx="${dx}" cy="${dy}" r="${rad}" fill="${st.color}" fill-opacity="${i === 0 ? 0.7 : 0.85}"/>\n`
    }
  }
  s += `<text x="${x+22}" y="${PY+PH-24}" font-size="14" font-family="${MONO}" font-weight="500" fill="${st.color}">${st.count}</text>\n`
  s += chip(x + PW - 22 - (st.tag.length * 7.6 + 22), PY + PH - 44, st.tag, st.color).svg
  if (st.gate) {
    const gx0 = px(i - 1) + PW, gx1 = x, mid = (gx0 + gx1) / 2, yy = PY + PH / 2
    s += `<line x1="${gx0+10}" y1="${yy}" x2="${gx1-14}" y2="${yy}" stroke="${C.sec}" stroke-opacity="0.55" stroke-width="1.5" stroke-dasharray="2 5" stroke-linecap="round"/>`
    s += `<polyline points="${gx1-20},${yy-5} ${gx1-13},${yy} ${gx1-20},${yy+5}" fill="none" stroke="${C.sec}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`
    st.gate.forEach((l, j) => s += `<text x="${mid}" y="${yy-18-(st.gate.length-1-j)*15}" text-anchor="middle" font-size="11" font-family="${MONO}" fill="${st.color}" xml:space="preserve">${l}</text>`)
    s += '\n'
  }
})
s += footer(W, H, `A monitor is a test you would want to be paged for. Tag those, leave the rest in CI, and the same spec runs in both places.`)
await write('images/guides/playwright-to-monitoring/test-to-monitor-journey.png', s + '</svg>')
