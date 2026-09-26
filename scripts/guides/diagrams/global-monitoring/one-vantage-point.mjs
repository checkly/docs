import fs from 'node:fs'
import { write } from '../lib.mjs'
const { cols, rows, dots } = JSON.parse(fs.readFileSync(new URL('./dots.json', import.meta.url)))
const W = 1200, H = 660
const MX = 40, MY = 118, MW = 1120
const step = MW / cols, MH = step * rows
const px = lon => MX + (lon + 180) / 360 * MW
const py = lat => MY + (72 - lat) / 130 * MH

const C = { bg: '#041734', dot: 'rgba(139,163,199,0.30)', border: 'rgba(120,150,185,0.34)', text: '#F0F4F8', sec: '#A7B8CB', dim: '#8497AC',
  blue: '#0075FF', green: '#20DF66', yellow: '#FFBD00', red: '#FF5C5C', card: 'rgba(6,27,56,0.92)' }
const FONT = `Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`

const origin = { x: px(-77.5), y: py(39) }
const monitor = { x: origin.x - 3, y: origin.y - 2 } // same region, drawn as a sibling node
const cities = [
  { name: 'Frankfurt', users: 'Users in Europe', lat: 50.1, lon: 8.7, color: C.green, status: 'Edge serving · 190 ms', breakAt: null, card: 'below' },
  { name: 'Tokyo', users: 'Users in Japan', lat: 35.7, lon: 139.7, color: C.yellow, status: 'Resolver · stale geo-DNS answer', breakAt: 0.12, card: 'below' },
  { name: 'São Paulo', users: 'Users in Brazil', lat: -23.5, lon: -46.6, color: C.yellow, status: 'Peering congested · 2.8 s', breakAt: 0.5, card: 'below' },
  { name: 'Sydney', users: 'Users in Australia', lat: -33.9, lon: 151.2, color: C.red, status: 'CDN PoP down · 503', breakAt: 0.12, card: 'below' },
]

// Quadratic route from city to origin, bowed toward the equator-ish middle
function route(a, b, bow) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy)
  const nx = -dy / len, ny = dx / len
  const cx = mx + nx * bow, cy = my + ny * bow
  const at = t => ({ x: (1-t)*(1-t)*a.x + 2*(1-t)*t*cx + t*t*b.x, y: (1-t)*(1-t)*a.y + 2*(1-t)*t*cy + t*t*b.y })
  return { d: `M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${b.x.toFixed(1)},${b.y.toFixed(1)}`, at }
}

let s = ''
s += `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" font-size="14" fill="${C.text}">\n`
s += `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041734"/><stop offset="1" stop-color="#0A2A55"/></linearGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
</defs>\n`
s += `<rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/>\n`
s += `<rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="20" fill="none" stroke="${C.border}"/>\n`

// Title
s += `<text x="40" y="52" font-size="24" font-weight="500" letter-spacing="-0.04em" fill="${C.text}">One vantage point tells you about one path</text>\n`
s += `<text x="40" y="80" font-size="15" fill="${C.sec}">A monitor next to the origin sees the origin. Users see the whole route, and every route is different.</text>\n`

// Dots
s += `<g fill="${C.dot}">\n`
for (const [c, r] of dots) s += `<circle cx="${(MX + (c + 0.5) * step).toFixed(1)}" cy="${(MY + (r + 0.5) * step).toFixed(1)}" r="2.1"/>`
s += `\n</g>\n`

// Routes
const bows = { Frankfurt: 60, Tokyo: 150, 'São Paulo': 60, Sydney: -70 }
const breaks = []
for (const c of cities) {
  c.x = px(c.lon); c.y = py(c.lat)
  const r = route(c, origin, bows[c.name])
  const dash = c.breakAt == null ? '' : ` stroke-dasharray="7 6"`
  s += `<path d="${r.d}" fill="none" stroke="${c.color}" stroke-width="2.2" stroke-opacity="${c.breakAt == null ? 0.9 : 0.55}" stroke-linecap="round"${dash}/>\n`
  if (c.breakAt != null) breaks.push({ p: r.at(c.breakAt), color: c.color })
}
// Monitor → origin (short, solid green, drawn on top)
const mon = { x: origin.x - 46, y: origin.y - 40 }
s += `<path d="M${mon.x.toFixed(1)},${mon.y.toFixed(1)} L${origin.x.toFixed(1)},${origin.y.toFixed(1)}" fill="none" stroke="${C.green}" stroke-width="2.2" stroke-linecap="round"/>\n`
s += `<path d="M${(mon.x-20).toFixed(1)},${(mon.y-12).toFixed(1)} L${mon.x.toFixed(1)},${mon.y.toFixed(1)}" fill="none" stroke="${C.border}" stroke-width="1.5"/>\n`

// Break markers
for (const b of breaks) {
  s += `<circle cx="${b.p.x.toFixed(1)}" cy="${b.p.y.toFixed(1)}" r="11" fill="${C.bg}" stroke="${b.color}" stroke-width="2"/>\n`
  s += `<path d="M${(b.p.x-4).toFixed(1)},${(b.p.y-4).toFixed(1)} l8,8 m0,-8 l-8,8" stroke="${b.color}" stroke-width="2.2" stroke-linecap="round"/>\n`
}

// Origin node
const pin = (x, y, color, big = false) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big?16:11}" fill="${color}" fill-opacity="0.18"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big?7:5}" fill="${color}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${big?7:5}" fill="none" stroke="${C.bg}" stroke-width="1.5"/>\n`
s += pin(origin.x, origin.y, C.blue, true)
for (const c of cities) s += pin(c.x, c.y, c.color)

// Card helper
function card(x, y, title, sub, subColor, w = 200, anchor = 'start') {
  const h = 54
  const bx = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2
  return `<g><rect x="${bx.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" rx="10" fill="${C.card}" stroke="${C.border}"/>
<text x="${(bx+14).toFixed(1)}" y="${(y+22).toFixed(1)}" font-size="14" font-weight="600" fill="${C.text}">${title}</text>
<text x="${(bx+14).toFixed(1)}" y="${(y+41).toFixed(1)}" font-size="13" fill="${subColor}">${sub}</text></g>\n`
}
// Monitor card (top-left of origin), origin card (below origin)
s += pin(mon.x, mon.y, C.green)
s += card(mon.x - 20, mon.y - 12 - 54, 'Monitor · us-east-1', '100% up · 24 ms', C.green, 200, 'end')
s += card(origin.x - 22, origin.y + 12, 'Origin · us-east-1', 'healthy', C.sec, 190, 'end')

// City cards
for (const c of cities) {
  const w = 236
  const y = c.card === 'above' ? c.y - 76 : c.y + 20
  let x = c.x, anchor = 'middle'
  if (c.x + w/2 > W - 24) { x = W - 24; anchor = 'end' }
  if (c.x - w/2 < 24) { x = 24; anchor = 'start' }
  s += card(x, y, `${c.users} · ${c.name}`, c.status, c.color, w, anchor)
}

// Footer callout
const fy = H - 74
s += `<rect x="40" y="${fy}" width="${W-80}" height="46" rx="10" fill="rgba(0,117,255,0.10)" stroke="rgba(0,117,255,0.35)"/>\n`
s += `<text x="${W/2}" y="${fy+29}" text-anchor="middle" font-size="15" fill="${C.text}">The dashboard says <tspan fill="${C.green}" font-weight="600">100% uptime</tspan>. A quarter of your users cannot check out. Both are true, because they measure different paths.</text>\n`
s += `</svg>\n`
await write('images/guides/global-monitoring/one-vantage-point.png', s)
console.log('ok', origin, cities.map(c=>[c.name, c.x|0, c.y|0]))
