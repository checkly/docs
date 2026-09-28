import { C, head, footer, write } from '../lib.mjs'
const W = 1200, H = 616
const times = ['00:00','00:05','00:10','00:15','00:20','00:25'], locs = ['Virginia','Frankfurt','Singapore','Sydney']
const X0 = 300, CW = 92, GAP = 18, colX = c => X0 + c * (CW + GAP)
let s = head(W, H, 'Round-robin spreads load. Parallel finds the region that is down.', 'Four locations, a check every 5 minutes, and the Sydney PoP goes dark at 00:02. Each cell is one run.')
const cell = (c, y, state) => { const x = colX(c), f = state === 'pass' ? C.green : state === 'fail' ? C.red : C.cell; return `<rect x="${x}" y="${y}" width="${CW}" height="24" rx="6" fill="${f}" fill-opacity="${state==='skip'?1:0.9}"/>` + (state === 'fail' ? `<text x="${x+CW/2}" y="${y+16.5}" text-anchor="middle" font-size="12" font-weight="600" fill="#fff">✕</text>` : state === 'pass' ? `<text x="${x+CW/2}" y="${y+16.5}" text-anchor="middle" font-size="12" font-weight="600" fill="#041734">✓</text>` : '') + '\n' }
function block(y, title, subtitle, grid, note, noteColor) {
  s += `<text x="40" y="${y+14}" font-size="16" font-weight="600">${title}</text><text x="40" y="${y+34}" font-size="12.5" fill="${C.sec}">${subtitle}</text>\n`
  locs.forEach((l, r) => { const ry = y + 56 + r * 32; s += `<text x="${X0-16}" y="${ry+16}" text-anchor="end" font-size="13" fill="${C.sec}">${l}</text>\n`; times.forEach((_, c) => s += cell(c, ry, grid[r][c])) })
  const nx = colX(6) + 6
  note.forEach((line, i) => s += `<text x="${nx}" y="${y+62+i*20}" font-size="13" fill="${i===0?noteColor:C.sec}" font-weight="${i===0?600:400}">${line}</text>\n`)
}
// time header + outage marker
const hy = 118
times.forEach((t, c) => s += `<text x="${colX(c)+CW/2}" y="${hy}" text-anchor="middle" font-size="12.5" fill="${C.dim}" font-family="'JetBrains Mono', ui-monospace, monospace">${t}</text>\n`)
const ox = colX(0) + (CW + GAP) * 0.4
s += `<line x1="${ox}" y1="${hy+10}" x2="${ox}" y2="${H-96}" stroke="${C.red}" stroke-dasharray="4 5" stroke-opacity="0.8"/><text x="${ox+8}" y="${hy+28}" font-size="12" fill="${C.red}" font-weight="600">Sydney PoP fails 00:02</text>\n`
const P='pass',F='fail',S='skip'
block(150, 'Round-robin', 'one location per interval', [[P,S,S,S,P,S],[S,P,S,S,S,P],[S,S,P,S,S,S],[S,S,S,F,S,S]], ['First failure at 00:15', '13 min after the outage. A retry', 'from Virginia passes, and it is', 'filed as a blip.'], C.red)
block(350, 'Parallel', 'all locations, every interval', [[P,P,P,P,P,P],[P,P,P,P,P,P],[P,P,P,P,P,P],[P,F,F,F,F,F]], ['First failure at 00:05', '3 min after the outage, and', 'three green rows say where', 'the problem is.'], C.green)
s += footer(W, H, `Round-robin suits load-sensitive endpoints where “up somewhere” is enough. Parallel suits anything where a region being down is an incident.`)
await write('images/guides/global-monitoring/parallel-vs-round-robin.png', s + '</svg>')
