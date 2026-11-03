// Fetches NYUAD's current student figures from the public Facts and Figures
// page and writes them as JSON for the "Live data" slide.
//
//   node scripts/nyuad-students.mjs      (or: pnpm --filter ./workshops/01-slidev data:students)
//
// Writes two copies of the same data:
//   nyuad-students.json               imported by NyuadStudents.vue (baked into the build)
//   public/data/nyuad-students.json   served next to the deck, re-read by the slide's Refresh button
//
// GitHub Actions runs this before every Pages build and once a day on a schedule
// (.github/workflows/deploy-pages.yml), so the published figures stay current.
// Fails soft: if the page can't be fetched or the figures can't be found, the
// existing JSON is left untouched and the build carries on.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE = 'https://nyuad.nyu.edu/en/about/facts-and-figures.html'
const deck = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputs = [
  join(deck, 'nyuad-students.json'),
  join(deck, 'public', 'data', 'nyuad-students.json'),
]

// Strip markup down to plain text so the figures can be matched by their labels.
function toText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
}

// "2,000+" -> 2000 (the "+" means "at least").
const toNumber = (s) => Number(String(s).replace(/[^\d]/g, ''))

async function main() {
  let html
  try {
    const res = await fetch(SOURCE, {
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'nyuad-ai-workshops build script (github.com/NYUAD-Core-Technology-Platforms/nyuad-ai-workshops)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  }
  catch (err) {
    console.warn(`nyuad-students: could not fetch ${SOURCE} (${err.message}); keeping the existing JSON.`)
    return
  }

  const text = toText(html)
  const ug = text.match(/(\d[\d,]*\+?)\s+Undergraduates\b/)
  const grad = text.match(/(\d[\d,]*\+?)\s+Graduate students\b/i)
  if (!ug || !grad) {
    console.warn('nyuad-students: figures not found on the page (layout changed?); keeping the existing JSON.')
    return
  }
  const year = text.match(/Academic Year\s+(\d{4}\s*[-–]\s*\d{4})/i)
  const asOf = text.match(/Data as of\s+([A-Za-z]+\s+\d{4})/i)

  const total = toNumber(ug[1]) + toNumber(grad[1])
  const data = {
    undergraduates: ug[1],
    graduates: grad[1],
    total: total.toLocaleString('en-US') + (/\+/.test(ug[1] + grad[1]) ? '+' : ''),
    academicYear: year ? year[1].replace(/\s*[-–]\s*/, '-') : null,
    dataAsOf: asOf ? asOf[1] : null,
    source: SOURCE,
    fetchedAt: new Date().toISOString(),
  }

  for (const file of outputs) {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify(data, null, 2) + '\n')
  }
  console.log(`nyuad-students: ${data.undergraduates} undergraduates, ${data.graduates} graduate students (${data.academicYear ?? 'year n/a'}).`)
}

main()
