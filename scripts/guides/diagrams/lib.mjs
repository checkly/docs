// Shared brand tokens and SVG helpers for guide diagrams, plus a renderer that
// writes a 2x PNG with Playwright. An SVG in an <img> can't load the page's web
// font, so diagrams ship as PNG rendered with Google Fonts Inter.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')

export const C = { border: 'rgba(120,150,185,0.34)', text: '#F0F4F8', sec: '#A7B8CB', dim: '#8497AC', blue: '#0075FF', green: '#20DF66', yellow: '#FFBD00', red: '#FF5C5C', card: 'rgba(6,27,56,0.92)', grid: 'rgba(139,163,199,0.18)', cell: 'rgba(139,163,199,0.14)' }
export const FONT = `Inter, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif`
export const head = (W, H, title, sub) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" font-size="14" fill="${C.text}">
<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#041734"/><stop offset="1" stop-color="#0A2A55"/></linearGradient></defs>
<rect width="${W}" height="${H}" rx="20" fill="url(#bg)"/><rect x="0.5" y="0.5" width="${W-1}" height="${H-1}" rx="20" fill="none" stroke="${C.border}"/>
<text x="40" y="52" font-size="24" font-weight="500" letter-spacing="-0.04em">${title}</text>
<text x="40" y="80" font-size="15" fill="${C.sec}">${sub}</text>\n`
export const footer = (W, H, html) => `<rect x="40" y="${H-74}" width="${W-80}" height="46" rx="10" fill="rgba(0,117,255,0.10)" stroke="rgba(0,117,255,0.35)"/>
<text x="${W/2}" y="${H-45}" text-anchor="middle" font-size="15">${html}</text>\n`
export const panel = (x, y, w, h, stroke = C.border, fill = C.card) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}"/>\n`
export const chip = (x, y, label, color = C.blue) => { const w = label.length * 7.6 + 22; return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="26" rx="13" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-opacity="0.5"/><text x="${x+w/2}" y="${y+17.5}" text-anchor="middle" font-size="12.5" font-weight="500" fill="${color}" font-family="'JetBrains Mono', ui-monospace, Menlo, monospace">${label}</text>\n` } }

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">'

// Render an SVG string to a PNG at `out`, a path relative to the repo root.
export async function write(out, svg) {
  const [, W, H] = svg.match(/width="(\d+)" height="(\d+)"/).map(Number)
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  await page.setContent(`<!doctype html><html><head>${FONTS}<style>body{margin:0}</style></head><body>${svg}</body></html>`, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(500)
  await page.locator('svg').first().screenshot({ path: path.join(ROOT, out), omitBackground: true })
  await browser.close()
  console.log(`wrote ${out}`)
}
