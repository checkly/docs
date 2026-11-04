import { write } from '../lib.mjs'
const W = 1200, H = 560
const C = { border: 'rgba(120,150,185,0.34)', text: '#F0F4F8', sec: '#A7B8CB', dim: '#8497AC', blue: '#0075FF', green: '#20DF66', grid: 'rgba(139,163,199,0.18)' }
const SEG = ['#B3D6FF', '#66ADFF', '#1F86FF', '#0057BF'] // DNS, TCP, TLS, HTTP: light → deep brand blue
const NAMES = ['DNS lookup', 'TCP handshake', 'TLS handshake', 'HTTP request → first byte']
const FONT = `Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`
const rows = [
  { n: 'Ohio', km: '700 km', rtt: 15 },
  { n: 'Frankfurt', km: '6,600 km', rtt: 90 },
  { n: 'São Paulo', km: '7,600 km', rtt: 120 },
  { n: 'Mumbai', km: '13,000 km', rtt: 190 },
  { n: 'Sydney', km: '16,000 km', rtt: 200 },
]
const X0 = 240, X1 = 1150, MAX = 800, ms = v => X0 + v / MAX * (X1 - X0)
const Y0 = 150, RH = 62, BH = 26
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" font-size="14" fill="${C.text}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041734"/><stop offset="1" stop-color="#0A2A55"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/><rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="20" fill="none" stroke="${C.border}"/>
<text x="40" y="52" font-size="24" font-weight="500" letter-spacing="-0.04em">Latency is distance, and a page load pays it four times</text>
<text x="40" y="80" font-size="15" fill="${C.sec}">Time to first byte from five places to an origin in Virginia. Four round trips happen before any HTML arrives, and each one is priced by distance.</text>\n`
// legend
let lx = 40
NAMES.forEach((nm, i) => {
  s += `<rect x="${lx}" y="${104}" width="12" height="12" rx="3" fill="${SEG[i]}"/><text x="${lx+18}" y="${115}" font-size="13" fill="${C.sec}">${nm}</text>\n`
  lx += 18 + nm.length * 7 + 26
})
// grid
for (let v = 0; v <= MAX; v += 200) {
  s += `<line x1="${ms(v)}" y1="${Y0-10}" x2="${ms(v)}" y2="${Y0 + rows.length*RH - 10}" stroke="${C.grid}"/>
<text x="${ms(v)}" y="${Y0 + rows.length*RH + 10}" text-anchor="${v===MAX?'end':'middle'}" font-size="12" fill="${C.dim}">${v} ms</text>\n`
}
rows.forEach((r, i) => {
  const y = Y0 + i * RH, total = r.rtt * 4
  s += `<text x="40" y="${y+BH/2-7}" font-weight="600" dominant-baseline="middle">${r.n}</text>
<text x="40" y="${y+BH/2+11}" font-size="12.5" fill="${C.dim}" dominant-baseline="middle">${r.km} · ${r.rtt} ms RTT</text>\n`
  for (let k = 0; k < 4; k++) {
    const x = ms(r.rtt * k), w = ms(r.rtt) - X0
    const rx = k === 0 ? `M${x},${y+BH} v-${BH-6} a6,6 0 0 1 6,-6 h${w-6} v${BH} h-${w-6} a6,6 0 0 1 -6,-6z` : k === 3 ? `M${x},${y} h${w-6} a6,6 0 0 1 6,6 v${BH-12} a6,6 0 0 1 -6,6 h-${w-6}z` : null
    s += rx ? `<path d="${rx}" fill="${SEG[k]}"/>\n` : `<rect x="${x}" y="${y}" width="${w}" height="${BH}" fill="${SEG[k]}"/>\n`
  }
  const inside = total >= MAX - 60
  s += inside
    ? `<text x="${ms(total)-12}" y="${y+BH/2+1}" text-anchor="end" font-size="13" font-weight="600" fill="#fff" dominant-baseline="middle">≈ ${total} ms</text>\n`
    : `<text x="${ms(total)+12}" y="${y+BH/2+1}" font-size="13" font-weight="600" fill="${C.text}" dominant-baseline="middle">≈ ${total} ms</text>\n`
})
const fy = H - 74
s += `<rect x="40" y="${fy}" width="${W-80}" height="46" rx="10" fill="rgba(0,117,255,0.10)" stroke="rgba(0,117,255,0.35)"/>
<text x="${W/2}" y="${fy+29}" text-anchor="middle" font-size="15">Nothing in your code is slow. Sydney is <tspan font-weight="600">13× further away</tspan> than Ohio, and every handshake pays for it. A monitor in Virginia never measures this.</text>
</svg>\n`
await write('images/guides/global-monitoring/round-trips.png', s)
