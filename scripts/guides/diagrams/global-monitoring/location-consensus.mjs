import { C, head, footer, panel, write } from '../lib.mjs'
const W = 1200, H = 560
let s = head(W, H, 'More locations, fewer pages: make the regions vote', 'Retry in the region that failed, then alert only when enough regions agree. One noisy path stops waking people up. A real outage still does.')
const locs = ['Virginia','Frankfurt','Singapore','Sydney']
function scenario(x, title, fails, verdict, verdictColor, why) {
  const PW = 540, y = 112
  s += panel(x, y, PW, 360)
  s += `<text x="${x+24}" y="${y+34}" font-size="16" font-weight="600">${title}</text>\n`
  locs.forEach((l, i) => {
    const ry = y + 62 + i * 50, bad = fails.includes(i), col = bad ? C.red : C.green
    s += `<rect x="${x+24}" y="${ry}" width="${PW-48}" height="40" rx="8" fill="rgba(139,163,199,0.06)"/>
<circle cx="${x+46}" cy="${ry+20}" r="9" fill="${col}"/><text x="${x+46}" y="${ry+24.5}" text-anchor="middle" font-size="11" font-weight="700" fill="#041734">${bad?'✕':'✓'}</text>
<text x="${x+66}" y="${ry+25}" font-size="14" font-weight="600">${l}</text>\n`
    if (bad) s += `<text x="${x+200}" y="${ry+25}" font-size="12.5" fill="${C.sec}">retry · same region</text><text x="${x+336}" y="${ry+25}" font-size="12.5" fill="${C.dim}">→</text><text x="${x+356}" y="${ry+25}" font-size="12.5" font-weight="600" fill="${C.red}">still failing</text>\n`
    else s += `<text x="${x+200}" y="${ry+25}" font-size="12.5" fill="${C.dim}">passing</text>\n`
  })
  // vote bar
  const by = y + 62 + 4 * 50 + 10, bx = x + 24, bw = PW - 48
  const pct = fails.length / 4
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="12" rx="6" fill="${C.cell}"/><rect x="${bx}" y="${by}" width="${bw*pct}" height="12" rx="6" fill="${verdictColor}"/>
<line x1="${bx+bw/2}" y1="${by-6}" x2="${bx+bw/2}" y2="${by+18}" stroke="${C.text}" stroke-width="2"/><text x="${bx+bw/2}" y="${by+34}" text-anchor="middle" font-size="11.5" fill="${C.dim}">threshold 50%</text>
<text x="${bx}" y="${by+34}" font-size="12.5" fill="${C.sec}">${fails.length} of 4 failing · ${pct*100}%</text>
<text x="${bx+bw}" y="${by+34}" text-anchor="end" font-size="13" font-weight="600" fill="${verdictColor}">${verdict}</text>
<text x="${bx}" y="${by+58}" font-size="12.5" fill="${C.sec}">${why}</text>\n`
}
scenario(40, 'A. One region has a bad path', [3], 'No page', C.green, 'Recorded and visible per location. Under the threshold, so nobody is woken.')
scenario(620, 'B. The service is down', [0,1,2], 'Alert', C.red, 'Sydney still passing is the first clue: look at the CDN or region routing.')
s += footer(W, H, `Retrying from a <tspan font-weight="600">different</tspan> region would have hidden scenario A. Same-region retries keep the evidence. The threshold decides whether it is a page.`)
await write('images/guides/global-monitoring/location-consensus.png', s + '</svg>')
