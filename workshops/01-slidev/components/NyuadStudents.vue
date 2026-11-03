<!--
  NyuadStudents: NYUAD's current student figures, with a Refresh button.

  Where the numbers come from: scripts/nyuad-students.mjs reads NYUAD's public
  Facts and Figures page and writes nyuad-students.json (baked into the build)
  plus public/data/nyuad-students.json (served next to the deck). GitHub Actions
  runs it before every Pages build and once a day on a schedule.

  Why Refresh re-reads our own JSON instead of NYUAD's page: a browser on
  github.io may not read another site's page unless that site allows it (CORS),
  and NYUAD's page does not. Our JSON is on the same site, so Refresh can fetch
  it live, and it picks up anything the daily job has published since the
  page was opened.
-->
<script setup lang="ts">
import { ref, computed } from 'vue'
import seed from '../nyuad-students.json'

interface StudentData {
  undergraduates: string
  graduates: string
  total: string
  academicYear: string | null
  dataAsOf: string | null
  source: string
  fetchedAt: string
}

const data = ref<StudentData>(seed as StudentData)
const loading = ref(false)
const status = ref('')
const failed = ref(false)

const fetchedOn = computed(() => {
  const d = new Date(data.value.fetchedAt)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
})

async function refresh() {
  loading.value = true
  failed.value = false
  try {
    const url = `${import.meta.env.BASE_URL}data/nyuad-students.json?t=${Date.now()}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    data.value = await res.json()
    status.value = `Checked at ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
  }
  catch {
    failed.value = true
    status.value = 'Could not reach the published data, showing the last known figures.'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="stu">
    <div class="stu__grid">
      <div class="stu__card stu__card--total">
        <div class="stu__value">{{ data.total }}</div>
        <div class="stu__label">students in total</div>
      </div>
      <div class="stu__card">
        <div class="stu__value">{{ data.undergraduates }}</div>
        <div class="stu__label">undergraduates</div>
      </div>
      <div class="stu__card">
        <div class="stu__value">{{ data.graduates }}</div>
        <div class="stu__label">graduate students</div>
      </div>
    </div>

    <div class="stu__bar">
      <button type="button" class="stu__btn" :disabled="loading" @click.stop="refresh">
        {{ loading ? 'Refreshing...' : '↻ Refresh' }}
      </button>
      <span class="stu__status" :class="{ 'is-error': failed }">{{ status }}</span>
    </div>

    <div class="stu__foot">
      <span v-if="data.academicYear">Academic year {{ data.academicYear }}</span>
      <span v-if="data.dataAsOf"> · data as of {{ data.dataAsOf }}</span>
      · source: <a :href="data.source" target="_blank" rel="noopener">NYUAD Facts and Figures</a>
      <span v-if="fetchedOn"> · fetched {{ fetchedOn }}</span>
    </div>
  </div>
</template>

<style scoped>
.stu {
  display: flex;
  flex-direction: column;
  gap: var(--s-4);
  margin-top: var(--s-2);
}
.stu__grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  gap: var(--s-4);
}
.stu__card {
  padding: var(--s-4) var(--s-5);
  background: var(--bg2);
  border: 1px solid var(--hairline);
  border-radius: var(--r-3);
}
.stu__card--total {
  background: var(--nyu-violet);
  border-color: var(--nyu-violet);
}
.stu__value {
  font-family: var(--font-serif);
  font-size: 52px;
  font-weight: 700;
  line-height: 1.05;
  color: var(--fg1);
  font-variant-numeric: tabular-nums;
}
.stu__label {
  margin-top: var(--s-1);
  font-size: var(--t-small);
  color: var(--fg2);
}
.stu__card--total .stu__value,
.stu__card--total .stu__label {
  color: var(--white);
}
.stu__bar {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}
.stu__btn {
  font: inherit;
  font-size: var(--t-small);
  font-weight: 700;
  line-height: 1;
  color: var(--white);
  background: var(--nyu-violet);
  border: none;
  border-radius: var(--r-2);
  padding: var(--s-2) var(--s-4);
  cursor: pointer;
}
.stu__btn:hover {
  background: var(--violet-700);
}
.stu__btn:disabled {
  opacity: 0.6;
  cursor: progress;
}
.stu__status {
  font-size: var(--t-small);
  color: var(--fg2);
}
.stu__status.is-error {
  color: var(--danger);
}
.stu__foot {
  font-size: var(--t-caption);
  color: var(--fg3);
}
.stu__foot a {
  color: var(--link);
}
</style>
