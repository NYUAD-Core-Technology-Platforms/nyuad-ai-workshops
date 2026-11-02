<!--
  OpmSensorDemo: how an optically pumped magnetometer (OPM) senses the brain.
  Ported from the OPM sensor panel of MegFigure.vue in the NeuroWaves lab
  CTP presentation (neurowaves-lab-documentation repo).

  A 795 nm laser pumps the Rb-87 atoms in a vapour cell so their spins line
  up. The slider sets the brain's magnetic field B: the stronger it is, the
  more the spins tilt away from the pumped direction, the more light the
  vapour absorbs, and the less light reaches the photodetector.

  Pure client-side: inline SVG plus Vue computed geometry, no libraries.
  The "light at detector" figure is illustrative, not a physical model.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'

// Brain field strength, 0 (no field) to 100 (strong field). Arbitrary units.
const bField = ref(0)

// Fixed per-atom tilt seeds (-1..1) so the layout is stable and reproducible
// as the slider moves. Rows fade slightly with depth, as in the original.
const ATOMS = [
  { x: 300, y: 92, seed: 0.35, o: 0.85 }, { x: 340, y: 92, seed: -0.75, o: 0.85 },
  { x: 380, y: 92, seed: 0.9, o: 0.85 }, { x: 420, y: 92, seed: -0.25, o: 0.85 },
  { x: 300, y: 130, seed: -0.6, o: 0.7 }, { x: 340, y: 130, seed: 0.15, o: 0.7 },
  { x: 380, y: 130, seed: -0.95, o: 0.7 }, { x: 420, y: 130, seed: 0.5, o: 0.7 },
  { x: 300, y: 168, seed: 0.8, o: 0.55 }, { x: 340, y: 168, seed: -0.4, o: 0.55 },
  { x: 380, y: 168, seed: 0.25, o: 0.55 }, { x: 420, y: 168, seed: -0.85, o: 0.55 },
]
const MAX_TILT_DEG = 85
const SPIN_LEN = 15

// Each spin is a short line from the atom centre; tilt from vertical scales with B.
const atoms = computed(() => {
  const f = bField.value / 100
  return ATOMS.map((a, i) => {
    const rad = (a.seed * MAX_TILT_DEG * f * Math.PI) / 180
    return {
      id: i, x: a.x, y: a.y, o: a.o, rad,
      tipX: (a.x + Math.sin(rad) * SPIN_LEN).toFixed(1),
      tipY: (a.y - Math.cos(rad) * SPIN_LEN).toFixed(1),
    }
  })
})

// Illustrative transmission: aligned spins (B = 0) let all the light through;
// tilted spins absorb more. Mean cos^2 of the tilt, mapped to 40..100 %.
const transmission = computed(() => {
  const m = atoms.value.reduce((s, a) => s + Math.cos(a.rad) ** 2, 0) / atoms.value.length
  return Math.round(40 + 60 * m)
})

// B-field arrow rising from the scalp into the cell; grows with B.
const bArrowY = computed(() => (262 - (bField.value / 100) * 62).toFixed(1))
const bOpacity = computed(() => (0.2 + (bField.value / 100) * 0.8).toFixed(2))

function reset() {
  bField.value = 0
}
</script>

<template>
  <div class="opm">
    <svg class="opm__svg" viewBox="0 0 720 300" role="img"
         aria-label="OPM sensor: laser, rubidium vapour cell, photodetector">
      <defs>
        <marker id="opmHead" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0,0 10,4 0,8" class="opm__laserfill" />
        </marker>
        <marker id="opmB" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
          <polygon points="0,0 10,4 0,8" class="opm__violetfill" />
        </marker>
      </defs>

      <!-- Sensor housing -->
      <rect x="20" y="18" width="680" height="208" rx="12" class="opm__housing" />
      <text x="686" y="40" text-anchor="end" class="opm__tag">OPM sensor · room temperature</text>

      <!-- Laser -->
      <rect x="44" y="108" width="110" height="46" rx="8" class="opm__laser" />
      <text x="99" y="137" text-anchor="middle" class="opm__laserlabel">Laser</text>
      <text x="99" y="98" text-anchor="middle" class="opm__laserlabel opm__laserlabel--sub">795 nm</text>
      <line x1="154" y1="131" x2="262" y2="131" class="opm__beam" marker-end="url(#opmHead)" />

      <!-- Vapour cell with Rb-87 atoms -->
      <rect x="270" y="62" width="180" height="138" rx="10" class="opm__cell" />
      <text x="360" y="54" text-anchor="middle" class="opm__celllabel">Rb-87 vapour cell</text>
      <g v-for="a in atoms" :key="a.id">
        <circle :cx="a.x" :cy="a.y" r="8" class="opm__atom" :opacity="a.o" />
        <line :x1="a.x" :y1="a.y" :x2="a.tipX" :y2="a.tipY" class="opm__spin" />
      </g>

      <!-- Transmitted beam: fades as the vapour absorbs more light -->
      <line x1="450" y1="131" x2="548" y2="131" class="opm__beam opm__beam--out"
            :opacity="(transmission / 100).toFixed(2)" marker-end="url(#opmHead)" />

      <!-- Photodetector -->
      <rect x="556" y="100" width="124" height="62" rx="8" class="opm__det" />
      <text x="618" y="126" text-anchor="middle" class="opm__detlabel">Photodetector</text>
      <text x="618" y="148" text-anchor="middle" class="opm__detval">{{ transmission }}% light</text>

      <!-- Brain field B rising from the scalp into the cell -->
      <line v-if="bField > 0" x1="360" y1="262" x2="360" :y2="bArrowY" class="opm__barrow"
            :opacity="bOpacity" marker-end="url(#opmB)" />
      <text x="372" y="244" class="opm__blabel" :opacity="bOpacity">B (brain field)</text>

      <!-- Scalp -->
      <path d="M 20 268 Q 360 252 700 268" class="opm__scalp" />
      <text x="40" y="290" class="opm__scalplabel">scalp, sensor in direct contact</text>
    </svg>

    <div class="opm__controls">
      <label class="opm__label" for="opm-b">Brain field B</label>
      <input id="opm-b" v-model.number="bField" type="range" min="0" max="100" step="1"
             class="opm__range" aria-label="Brain magnetic field strength"
             @click.stop @keydown.stop />
      <span class="opm__val">{{ bField }}</span>
      <span class="opm__state">{{ bField === 0 ? 'Spins aligned, light passes' : 'Spins tilting, light absorbed' }}</span>
      <button class="opm__btn" @click.stop="reset">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.opm {
  /* Local colours: light mode uses the brand tokens; dark mode lifts the
     laser red and violet so they stay readable on the deep-violet ground. */
  --opm-laser: var(--danger);
  --opm-violet: var(--accent-ink);
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}
:global(html.dark .opm) {
  --opm-laser: color-mix(in srgb, var(--danger) 45%, var(--white));
}
.opm__svg {
  width: 100%;
  height: 270px; /* fixed box; viewBox scales inside it */
  display: block;
}
.opm__housing {
  fill: var(--surface-sand);
  stroke: var(--gold);
  stroke-width: 2;
}
.opm__tag {
  fill: var(--gold);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.opm__laser {
  fill: var(--bg1);
  stroke: var(--opm-laser);
  stroke-width: 2;
}
.opm__laserlabel {
  fill: var(--opm-laser);
  font-size: 16px;
  font-weight: 700;
}
.opm__laserlabel--sub {
  font-size: 13px;
  font-weight: 600;
}
.opm__laserfill {
  fill: var(--opm-laser);
}
.opm__violetfill {
  fill: var(--opm-violet);
}
.opm__beam {
  stroke: var(--opm-laser);
  stroke-width: 5;
  opacity: 0.7;
}
.opm__beam--out {
  stroke-width: 4;
  transition: opacity 0.15s;
}
.opm__cell {
  fill: var(--bg1);
  stroke: var(--gold);
  stroke-width: 2.5;
}
.opm__celllabel {
  fill: var(--gold);
  font-size: 15px;
  font-weight: 700;
}
.opm__atom {
  fill: var(--gold);
}
.opm__spin {
  stroke: var(--fg1);
  stroke-width: 2.5;
  stroke-linecap: round;
}
.opm__det {
  fill: var(--bg1);
  stroke: var(--opm-violet);
  stroke-width: 2;
}
.opm__detlabel {
  fill: var(--opm-violet);
  font-size: 14px;
  font-weight: 700;
}
.opm__detval {
  fill: var(--fg2);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.opm__barrow {
  stroke: var(--opm-violet);
  stroke-width: 2.5;
  stroke-dasharray: 6 4;
}
.opm__blabel {
  fill: var(--opm-violet);
  font-size: 13px;
  font-weight: 600;
}
.opm__scalp {
  fill: none;
  stroke: var(--warning);
  stroke-width: 4;
}
.opm__scalplabel {
  fill: var(--warning);
  font-size: 13px;
}
.opm__controls {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding-top: var(--s-2);
  border-top: 1px solid var(--hairline);
}
.opm__label {
  font-size: var(--t-small);
  font-weight: 600;
  color: var(--fg1);
  white-space: nowrap;
}
.opm__range {
  flex: 0 1 260px;
  accent-color: var(--nyu-violet);
  cursor: pointer;
}
.opm__val {
  min-width: 28px;
  font-size: var(--t-small);
  font-variant-numeric: tabular-nums;
  color: var(--fg1);
}
.opm__state {
  flex: 1;
  font-size: var(--t-small);
  color: var(--fg2);
}
.opm__btn {
  font: inherit;
  font-size: var(--t-small);
  font-weight: 700;
  line-height: 1;
  color: var(--accent-ink);
  background: transparent;
  border: 1px solid var(--accent-ink);
  border-radius: var(--r-2);
  padding: var(--s-1) var(--s-3);
  cursor: pointer;
}
</style>
