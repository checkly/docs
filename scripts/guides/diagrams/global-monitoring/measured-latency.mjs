import { C, head, footer, write } from '../lib.mjs'
const W = 1200, H = 668
const rows = [['N. Virginia','us-east-1',22],['Montreal','ca-central-1',102],['Ireland','eu-west-1',302],['Oregon','us-west-2',309],['Frankfurt','eu-central-1',376],['Stockholm','eu-north-1',451],['São Paulo','sa-east-1',468],['Tokyo','ap-northeast-1',641],['Mumbai','ap-south-1',750],['Sydney','ap-southeast-2',890],['Singapore','ap-southeast-1',909],['Cape Town','af-south-1',1079]]
const X0 = 250, X1 = 1150, MAX = 1200, ms = v => X0 + v / MAX * (X1 - X0), Y0 = 120, RH = 38, BH = 20
let s = head(W, H, 'The same page, measured from twelve places at once', 'Median response time of the URL monitor against the demo shop, hosted in us-east-1. Three parallel runs, 23 September 2026.')
for (let v = 0; v <= MAX; v += 300) s += `<line x1="${ms(v)}" y1="${Y0-8}" x2="${ms(v)}" y2="${Y0+rows.length*RH-10}" stroke="${C.grid}"/><text x="${ms(v)}" y="${Y0+rows.length*RH+8}" text-anchor="${v===MAX?'end':'middle'}" font-size="12" fill="${C.dim}">${v} ms</text>\n`
rows.forEach(([n, id, v], i) => {
  const y = Y0 + i * RH, hl = n === 'Oregon' || n === 'Ireland'
  s += `<text x="40" y="${y+BH/2}" font-weight="600" dominant-baseline="middle" fill="${hl ? C.yellow : C.text}">${n}</text><text x="${X0-16}" y="${y+BH/2}" text-anchor="end" font-size="12" fill="${C.dim}" dominant-baseline="middle" font-family="'JetBrains Mono', ui-monospace, monospace">${id}</text>
<rect x="${X0}" y="${y}" width="${ms(v)-X0}" height="${BH}" rx="5" fill="${hl ? C.yellow : C.blue}" fill-opacity="${hl ? 0.9 : 0.85}"/>
<text x="${ms(v)+10}" y="${y+BH/2}" font-size="13" font-weight="600" dominant-baseline="middle">${v.toLocaleString()} ms</text>\n`
})
// annotation for Oregon/Ireland
const ay = Y0 + 2 * RH + BH / 2, ax = ms(309) + 90
s += `<path d="M${ax},${ay-4} v${RH+8}" stroke="${C.yellow}" stroke-opacity="0.6"/><text x="${ax+12}" y="${ay+RH/2+5}" font-size="12.5" fill="${C.yellow}">Oregon shares a continent with the origin and is still slower than Ireland</text>\n`
s += footer(W, H, `A <tspan font-weight="600">49× spread</tspan> for one static page. Routing decides the tail, not the map, so you have to measure from there.`)
await write('images/guides/global-monitoring/measured-latency.png', s + '</svg>')
