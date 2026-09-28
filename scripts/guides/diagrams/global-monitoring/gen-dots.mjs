// Regenerates dots.json, the dot-matrix world map used by one-vantage-point.mjs.
// Needs extra packages: npm i --no-save d3-geo topojson-client world-atlas
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { geoContains } from 'd3-geo'
import * as topojson from 'topojson-client'
const topo = JSON.parse(fs.readFileSync(createRequire(import.meta.url).resolve('world-atlas/land-50m.json')))
const land = topojson.feature(topo, topo.objects.land)
// grid over lon -180..180, lat 72..-58
const cols = 180, rows = Math.round(180 * (130/360))
const dots = []
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
  const lon = -180 + (c + 0.5) * 360 / cols
  const lat = 72 - (r + 0.5) * 130 / rows
  if (geoContains(land, [lon, lat])) dots.push([c, r])
}
fs.writeFileSync(new URL('./dots.json', import.meta.url), JSON.stringify({ cols, rows, dots }))
console.log(cols, rows, dots.length)
