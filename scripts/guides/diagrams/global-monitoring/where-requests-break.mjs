import { write } from '../lib.mjs'
const W = 1200, H = 386
const C = { border: 'rgba(120,150,185,0.34)', text: '#F0F4F8', sec: '#A7B8CB', dim: '#8497AC', blue: '#0075FF', green: '#20DF66', red: '#FF5C5C', card: 'rgba(6,27,56,0.92)', dot: 'rgba(139,163,199,0.30)' }
const FONT = `Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`
const hops = [
  { t: "User's device", s: 'browser, app', fail: null },
  { t: 'DNS', s: 'resolver, geo / anycast', fail: 'stale geo-DNS answer' },
  { t: 'CDN edge', s: 'nearest PoP, cache, WAF', fail: 'one PoP returning 503' },
  { t: 'Transit', s: 'ISP peering, BGP', fail: 'submarine cable cut' },
  { t: 'Cloud region', s: 'load balancer, TLS', fail: 'bad deploy in one region' },
  { t: 'Your code', s: 'and what it calls', fail: 'payment provider down' },
]
const n = hops.length, gap = 22, bw = (W - 80 - gap * (n - 1)) / n, bh = 64, by = 130
const cx = i => 40 + i * (bw + gap) + bw / 2
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" font-size="14" fill="${C.text}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041734"/><stop offset="1" stop-color="#0A2A55"/></linearGradient>
<marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L8,5 L0,9" fill="none" stroke="${C.dim}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>
<rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/><rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="20" fill="none" stroke="${C.border}"/>
<text x="40" y="52" font-size="24" font-weight="500" letter-spacing="-0.04em">Where a request breaks, and who can see it</text>
<text x="40" y="80" font-size="15" fill="${C.sec}">Six hops sit between a user and your code. Only the first is the same for everyone.</text>\n`
hops.forEach((h, i) => {
  const x = 40 + i * (bw + gap), last = i === n - 1, first = i === 0
  s += `<rect x="${x}" y="${by}" width="${bw}" height="${bh}" rx="12" fill="${last ? 'rgba(0,117,255,0.16)' : C.card}" stroke="${last ? C.blue : C.border}" stroke-width="${last ? 1.5 : 1}"/>
<text x="${cx(i)}" y="${by+27}" text-anchor="middle" font-weight="600">${h.t}</text>
<text x="${cx(i)}" y="${by+47}" text-anchor="middle" font-size="12.5" fill="${C.sec}">${h.s}</text>\n`
  if (!last) s += `<line x1="${x+bw+3}" y1="${by+bh/2}" x2="${x+bw+gap-3}" y2="${by+bh/2}" stroke="${C.dim}" stroke-width="1.6" marker-end="url(#ar)"/>\n`
  // failure tag
  if (h.fail) s += `<text x="${cx(i)}" y="${by+bh+30}" text-anchor="middle" font-size="12.5" fill="${C.red}">✕ ${h.fail}</text>\n`
  else s += `<text x="${cx(i)}" y="${by+bh+30}" text-anchor="middle" font-size="12.5" fill="${C.dim}">same everywhere</text>\n`
})
// coverage bars
function bar(y, from, to, color, label, note) {
  const x1 = 40 + from * (bw + gap), x2 = 40 + to * (bw + gap) + bw
  s += `<rect x="${x1}" y="${y}" width="${x2-x1}" height="34" rx="8" fill="${color}" fill-opacity="0.14" stroke="${color}" stroke-opacity="0.6"/>
<text x="${x1+14}" y="${y+22}" font-size="13.5" font-weight="600" fill="${color}">${label}</text>
<text x="${x2-14}" y="${y+22}" text-anchor="end" font-size="13" fill="${C.sec}">${note}</text>\n`
}
bar(by + bh + 62, 4, 5, C.dim.replace('#8497AC','#A7B8CB'), 'Origin telemetry sees', 'CPU, error rate, traces')
bar(by + bh + 110, 0, 5, C.green, 'A monitor in the user’s region sees', 'every hop, because it sends the request down the same path')
s += `</svg>\n`
await write('images/guides/global-monitoring/where-requests-break.png', s)
