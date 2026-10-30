// Project, group, and check levels of the structure-a-project sample, with the
// settings each level sets and the one check that overrides an inherited value.
import { C, head, footer, chip, panel, write } from '../lib.mjs'
const W = 1200, H = 656
const MONO = `'JetBrains Mono', ui-monospace, Menlo, monospace`
let s = head(W, H, 'Settings flow down. The nearest level wins.',
  'Each box lists only what that level sets. Everything else it inherits from the level above.')

const node = (x, y, w, h, title, file, chips, note) => {
  s += panel(x, y, w, h)
  s += `<text x="${x+20}" y="${y+30}" font-size="16" font-weight="500">${title}</text>`
  s += `<text x="${x+20}" y="${y+50}" font-size="12" font-family="${MONO}" fill="${C.dim}">${file}</text>\n`
  let cx = x + 20
  for (const [label, color] of chips) { const c = chip(cx, y + 62, label, color); s += c.svg; cx += c.w + 8 }
  if (note) s += `<text x="${x+20}" y="${y+80}" font-size="13" fill="${C.sec}" font-style="italic">${note}</text>\n`
}
const link = (x1, y1, x2, y2) =>
  s += `<path d="M${x1},${y1} C${x1},${(y1+y2)/2} ${x2},${(y1+y2)/2} ${x2},${y2}" fill="none" stroke="${C.sec}" stroke-opacity="0.45" stroke-width="1.5"/>
<circle cx="${x2}" cy="${y2}" r="3" fill="${C.sec}" fill-opacity="0.8"/>\n`

const G = C.green, B = C.blue, D = C.dim
// Tier 1: project
const P = { x: 250, y: 108, w: 700, h: 104 }
node(P.x, P.y, P.w, P.h, 'Project', 'checkly.config.ts',
  [['every 10m', G], ['us-east-1', G], ['eu-west-1', G], ['shop', G], ['ops-email', G]])
// Tier 2: groups
const GY = 268, GH = 104
const WEB = { x: 60, w: 560 }, API = { x: 680, w: 460 }
node(WEB.x, GY, WEB.w, GH, 'Shop web group', '__checks__/web/group.ts',
  [['web', G], ['us-east-1', B], ['eu-west-1', B], ['ap-southeast-1', B]])
node(API.x, GY, API.w, GH, 'Shop API group', '__checks__/api/group.ts',
  [['api', G], ['API_BASE_URL', G]])
// Tier 3: checks
const KY = 428, KH = 104, KW = 270
node(60, KY, KW, KH, 'Homepage uptime', 'web/uptime.check.ts', [['every 1m', B]])
node(350, KY, KW, KH, 'Homepage renders', 'web/homepage.check.ts', [], 'sets nothing, inherits everything')
node(775, KY, KW, KH, 'Books catalog', 'api/books.check.ts', [['{{API_BASE_URL}}/books', G]])
// Links: project -> groups -> checks
const pc = P.x + P.w / 2
link(pc, P.y + P.h, WEB.x + WEB.w / 2, GY)
link(pc, P.y + P.h, API.x + API.w / 2, GY)
link(WEB.x + WEB.w / 2, GY + GH, 60 + KW / 2, KY)
link(WEB.x + WEB.w / 2, GY + GH, 350 + KW / 2, KY)
link(API.x + API.w / 2, GY + GH, 775 + KW / 2, KY)
// Legend
const lg = (x, color, label) => { s += `<circle cx="${x}" cy="${H-100}" r="5" fill="${color}"/><text x="${x+12}" y="${H-96}" font-size="12.5" fill="${C.sec}">${label}</text>\n`; return x + 12 + label.length * 6.6 + 24 }
let lx = lg(40, G, 'set at this level'); lx = lg(lx, B, 'overrides the level above')
s += footer(W, H, `A value on the check wins over the group, which wins over the project. Homepage uptime runs every minute. The other two keep the project's ten.`)
await write('images/guides/structure-a-project/settings-inheritance.png', s + '</svg>')
