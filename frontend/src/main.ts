import './style.css'

type RecordingSegment = {
  startedAt: string
  endedAt: string
  durationMs: number
}

const recordingState = {
  active: false,
  paused: false,
  segmentStartAt: null as number | null,
  segments: [] as RecordingSegment[],
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<div class="app-shell">
  <header class="titlebar" aria-label="Window title">
    <span class="titlebar-title">Surgical Vision — Camera</span>
    <div class="titlebar-spacer"></div>
    <div class="titlebar-toolbar-mobile" aria-label="Quick actions">
      <button type="button" class="sidebar-icon-btn theme-toggle" title="Toggle color theme" aria-label="Toggle color theme">
        <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
      </button>
      <button type="button" class="sidebar-icon-btn profile-btn" title="Profile" aria-label="Profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
      </button>
    </div>
  </header>

  <div class="workspace">
    <aside class="sidebar" aria-label="Navigation">
      <div class="sidebar-head">
        <div class="sidebar-header">Workspace</div>
        <div class="sidebar-head-actions">
          <button type="button" class="sidebar-icon-btn theme-toggle" title="Toggle color theme" aria-label="Toggle color theme">
            <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </button>
          <button type="button" class="sidebar-icon-btn profile-btn" title="Profile" aria-label="Profile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
          </button>
        </div>
      </div>
      <ul class="nav-list">
        <li>
          <button type="button" class="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 19V5M16 5h4v14M4 9h12M4 15h8"/>
            </svg>
            Live detection
          </button>
        </li>
        <li>
          <button type="button" class="nav-item" data-action="snapshot">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v2M12 20v2"/>
            </svg>
            Snapshot
          </button>
        </li>
        <li>
          <button type="button" class="nav-item" data-action="export-clip">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Export recording
          </button>
        </li>
      </ul>
      <div class="sidebar-footer">
        <span class="sidebar-footer-main">OR-7 · Mock feed · UI preview only</span>
        <span class="sidebar-footer-feedback" id="sidebar-feedback" role="status" aria-live="polite"></span>
      </div>
    </aside>

    <div class="resize-handle resize-handle-col" data-resize="sidebar" role="separator" aria-orientation="vertical" aria-label="Resize navigation width"></div>

    <div class="center-stack">
      <div class="camera-area">
        <div class="camera-toolbar">
          <div class="breadcrumb" aria-label="Breadcrumb">
            <span>OR Suite</span>
            <span class="breadcrumb-sep">›</span>
            <span>OR-7</span>
            <span class="breadcrumb-sep">›</span>
            <span>Camera 1</span>
          </div>
          <div class="camera-toolbar-actions">
            <button type="button" class="tool-btn" id="camera-pause-btn" disabled aria-disabled="true">Pause</button>
            <button type="button" class="tool-btn primary" id="camera-record-btn" aria-pressed="false">Record</button>
          </div>
        </div>
        <div class="camera-viewport" role="img" aria-label="Simulated camera feed with detection overlays">
          <div class="camera-feed"></div>
          <div class="camera-vignette"></div>
          <div class="camera-overlay">
            <div class="crosshair"></div>
            <div class="detection-box box-1">
              <span class="label">Mayo scissors · 0.94</span>
            </div>
            <div class="detection-box box-2">
              <span class="label">Forceps · 0.88</span>
            </div>
          </div>
          <div class="camera-badges">
            <span class="badge badge-live"><span class="pulse" aria-hidden="true"></span><span>LIVE</span></span>
            <span class="badge badge-rec" id="recording-indicator" hidden>REC</span>
            <span class="badge badge-meta" id="camera-viewport-size-label" aria-live="polite">—×— · 30fps</span>
          </div>
          <p class="camera-hint">Camera preview is simulated — connect device to enable capture</p>
        </div>
      </div>

      <div class="resize-handle resize-handle-row" data-resize="panel" role="separator" aria-orientation="horizontal" aria-label="Resize recent tools height"></div>

      <section class="bottom-panel" aria-label="Session panels">
        <div class="panel-tabs" role="tablist">
          <button type="button" class="panel-tab active" role="tab" id="tab-recent" aria-selected="true" aria-controls="panel-recent" tabindex="0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 6h16M4 12h10M4 18h14"/>
            </svg>
            Recent tools
          </button>
          <button type="button" class="panel-tab" role="tab" id="tab-session" aria-selected="false" aria-controls="panel-session" tabindex="-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 19V5M8 5v14M12 5v10M16 5v14M20 5v8"/>
            </svg>
            Session
          </button>
        </div>
        <div class="panel-body">
          <div class="panel-pane" id="panel-recent" role="tabpanel" aria-labelledby="tab-recent">
          <div class="recent-tools">
            <div class="recent-chip">
              <span class="recent-chip-thumb" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 23l14-14M11 9l12 12M7 21l10-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M8 24l4-4M20 8l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="7" cy="25" r="2" stroke="currentColor" stroke-width="1.4"/><circle cx="25" cy="7" r="2" stroke="currentColor" stroke-width="1.4"/></svg>
              </span>
              <span class="recent-chip-text"><time>14:02:18</time><strong>Mayo scissors</strong></span>
            </div>
            <div class="recent-chip">
              <span class="recent-chip-thumb" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 22c0-4 4-8 8-8s8 4 8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M10 24h12M11 20h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M14 12l2-6M18 12l-2-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
              </span>
              <span class="recent-chip-text"><time>14:02:05</time><strong>Adson forceps</strong></span>
            </div>
            <div class="recent-chip">
              <span class="recent-chip-thumb" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 24c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm12 0c-2 0-3-1-3-3s1-3 3-3 3 1 3 3-1 3-3 3z" stroke="currentColor" stroke-width="1.4"/><path d="M11 21l4-10M21 21l-4-10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15 11h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </span>
              <span class="recent-chip-text"><time>14:01:47</time><strong>Needle holder</strong></span>
            </div>
            <div class="recent-chip">
              <span class="recent-chip-thumb" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 20l10-10 2 2-10 10H8v-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M18 10l6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 22v4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="recent-chip-text"><time>14:01:22</time><strong>Scalpel #15</strong></span>
            </div>
            <div class="recent-chip">
              <span class="recent-chip-thumb" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 26V14c0-2 2-4 4-4h6l8-4v16l-8-4h-6c-2 0-4 2-4 4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="27" r="1.5" fill="currentColor"/></svg>
              </span>
              <span class="recent-chip-text"><time>14:00:58</time><strong>Suction tip</strong></span>
            </div>
          </div>
          </div>
          <div class="panel-pane" id="panel-session" role="tabpanel" aria-labelledby="tab-session" hidden>
            <div class="status-block status-block--panel">
              <div class="status-row">
                <span>Confidence</span>
                <span>avg 0.91</span>
              </div>
              <div class="status-row">
                <span>Latency</span>
                <span>42 ms</span>
              </div>
              <div class="status-row">
                <span>Tracked tools</span>
                <span>12</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="resize-handle resize-handle-col" data-resize="right" role="separator" aria-orientation="vertical" aria-label="Resize sidebar width"></div>

    <aside class="right-sidebar" aria-label="Timeline and status">
      <div class="timeline-block">
        <div class="sidebar-header">Timeline</div>
        <ul class="timeline-list timeline-list--sidebar">
          <li class="timeline-item timeline-item--event"><time class="timeline-time">14:02:18</time><span class="timeline-text">Mayo scissors · confidence 0.94</span></li>
          <li class="timeline-item timeline-item--event"><time class="timeline-time">14:02:05</time><span class="timeline-text">Adson forceps · confidence 0.91</span></li>
          <li class="timeline-item timeline-item--event"><time class="timeline-time">14:01:47</time><span class="timeline-text">Needle holder · confidence 0.89</span></li>
          <li class="timeline-item timeline-item--note"><time class="timeline-time">14:01:00</time><span class="timeline-text">Recording segment started</span></li>
          <li class="timeline-item timeline-item--event"><time class="timeline-time">14:00:58</time><span class="timeline-text">Suction tip · confidence 0.87</span></li>
          <li class="timeline-item timeline-item--note"><time class="timeline-time">13:58:12</time><span class="timeline-text">Live detection session active</span></li>
        </ul>
      </div>
      <div class="status-bar">
        <span>Ready</span><span class="sep">|</span><span>UI mock</span>
      </div>
    </aside>
  </div>
</div>
`

function parseCssPx(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function setupResizableLayout(): void {
  const root = document.documentElement

  document.querySelectorAll<HTMLElement>('.resize-handle[data-resize]').forEach((handle) => {
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return
      e.preventDefault()

      const axis = handle.dataset.resize
      if (!axis || (axis !== 'sidebar' && axis !== 'right' && axis !== 'panel')) return

      const prop =
        axis === 'sidebar' ? '--sidebar-w' : axis === 'right' ? '--right-w' : '--panel-h'

      const min = axis === 'sidebar' ? 160 : axis === 'right' ? 200 : 120
      const max = axis === 'sidebar' ? 420 : axis === 'right' ? 480 : 400

      const startX = e.clientX
      const startY = e.clientY
      const startVal = parseCssPx(getComputedStyle(root).getPropertyValue(prop))

      handle.classList.add('is-dragging')
      document.body.style.cursor = axis === 'panel' ? 'ns-resize' : 'col-resize'
      document.body.style.userSelect = 'none'

      const onMove = (ev: PointerEvent) => {
        if (axis === 'panel') {
          const dy = ev.clientY - startY
          const next = clamp(startVal - dy, min, max)
          root.style.setProperty(prop, `${next}px`)
        } else if (axis === 'sidebar') {
          const dx = ev.clientX - startX
          const next = clamp(startVal + dx, min, max)
          root.style.setProperty(prop, `${next}px`)
        } else {
          const dx = ev.clientX - startX
          const next = clamp(startVal - dx, min, max)
          root.style.setProperty(prop, `${next}px`)
        }
      }

      const onUp = () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerup', onUp)
        handle.classList.remove('is-dragging')
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerup', onUp)
    })
  })
}

function setupBottomPanelTabs(): void {
  const tablist = document.querySelector<HTMLElement>('.panel-tabs')
  if (!tablist) return
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
  const panes = document.querySelectorAll<HTMLElement>('.panel-body .panel-pane')
  if (tabs.length === 0 || tabs.length !== panes.length) return

  const selectTab = (index: number) => {
    tabs.forEach((tab, i) => {
      const active = i === index
      tab.classList.toggle('active', active)
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      panes[i]?.toggleAttribute('hidden', !active)
    })
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      selectTab(index)
    })
  })

  tablist.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true')
    if (current < 0) return
    const next =
      e.key === 'ArrowRight'
        ? (current + 1) % tabs.length
        : (current - 1 + tabs.length) % tabs.length
    selectTab(next)
    tabs[next]?.focus()
  })
}

function setupCameraViewportSizeLabel(): void {
  const viewport = document.querySelector<HTMLElement>('.camera-viewport')
  const label = document.querySelector<HTMLElement>('#camera-viewport-size-label')
  if (!viewport || !label) return

  const update = () => {
    const w = Math.round(viewport.clientWidth)
    const h = Math.round(viewport.clientHeight)
    label.textContent = `${w}×${h} · 30fps`
  }

  update()
  const ro = new ResizeObserver(() => {
    update()
  })
  ro.observe(viewport)
}

function downloadBlob(blob: Blob, filename: string): void {
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function formatFileTimestamp(d: Date): string {
  return d.toISOString().replace(/[:.]/g, '-').slice(0, 19)
}

function showSidebarFeedback(message: string): void {
  const el = document.getElementById('sidebar-feedback')
  if (!el) return
  el.textContent = message
  window.setTimeout(() => {
    el.textContent = ''
  }, 3200)
}

function collectRecentToolsFromDom(): { time: string; name: string }[] {
  const out: { time: string; name: string }[] = []
  document.querySelectorAll('.recent-chip').forEach((chip) => {
    const time = chip.querySelector('time')?.textContent?.trim() ?? ''
    const name = chip.querySelector('strong')?.textContent?.trim() ?? ''
    if (time || name) out.push({ time, name })
  })
  return out
}

function updateRecordingUI(): void {
  const recordBtn = document.getElementById('camera-record-btn') as HTMLButtonElement | null
  const pauseBtn = document.getElementById('camera-pause-btn') as HTMLButtonElement | null
  const indicator = document.getElementById('recording-indicator')
  if (recordBtn) {
    recordBtn.textContent = recordingState.active ? 'Stop' : 'Record'
    recordBtn.setAttribute('aria-pressed', String(recordingState.active))
  }
  if (pauseBtn) {
    const canPause = recordingState.active
    pauseBtn.disabled = !canPause
    pauseBtn.setAttribute('aria-disabled', String(!canPause))
    pauseBtn.textContent = recordingState.paused ? 'Resume' : 'Pause'
  }
  if (indicator) {
    indicator.toggleAttribute('hidden', !recordingState.active)
  }
}

function toggleRecording(): void {
  if (!recordingState.active) {
    recordingState.active = true
    recordingState.paused = false
    recordingState.segmentStartAt = Date.now()
  } else {
    if (recordingState.segmentStartAt == null) return
    const end = Date.now()
    recordingState.segments.push({
      startedAt: new Date(recordingState.segmentStartAt).toISOString(),
      endedAt: new Date(end).toISOString(),
      durationMs: end - recordingState.segmentStartAt,
    })
    recordingState.active = false
    recordingState.paused = false
    recordingState.segmentStartAt = null
  }
  updateRecordingUI()
}

function togglePause(): void {
  if (!recordingState.active) return
  recordingState.paused = !recordingState.paused
  updateRecordingUI()
}

function takeSnapshot(): void {
  const viewport = document.querySelector<HTMLElement>('.camera-viewport')
  if (!viewport) return
  const w = Math.max(1, Math.round(viewport.clientWidth))
  const h = Math.max(1, Math.round(viewport.clientHeight))
  const maxEdge = 1920
  const scale = Math.min(1, maxEdge / Math.max(w, h))
  const cw = Math.round(w * scale)
  const ch = Math.round(h * scale)
  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    showSidebarFeedback('Snapshot failed')
    return
  }
  const lg = ctx.createLinearGradient(0, 0, cw, ch)
  lg.addColorStop(0, '#e8e8e0')
  lg.addColorStop(0.45, '#c8d4e0')
  lg.addColorStop(1, '#3d4f62')
  ctx.fillStyle = lg
  ctx.fillRect(0, 0, cw, ch)
  ctx.fillStyle = 'rgba(15, 20, 30, 0.25)'
  ctx.fillRect(0, 0, cw, ch)
  ctx.fillStyle = '#feffea'
  ctx.font = '600 16px system-ui, -apple-system, sans-serif'
  ctx.fillText('Surgical Vision', 16, 32)
  ctx.font = '12px ui-monospace, monospace'
  ctx.fillStyle = 'rgba(254, 255, 234, 0.9)'
  ctx.fillText(new Date().toISOString(), 16, 54)
  ctx.fillText(`${w}×${h}px (viewport)`, 16, 74)
  ctx.fillStyle = 'rgba(254, 255, 234, 0.65)'
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillText('Simulated frame — connect camera for real capture', 16, 98)
  canvas.toBlob((blob) => {
    if (!blob) {
      showSidebarFeedback('Snapshot failed')
      return
    }
    downloadBlob(blob, `snapshot-${formatFileTimestamp(new Date())}.png`)
    showSidebarFeedback('Snapshot saved')
  }, 'image/png')
}

function exportRecordingJson(): void {
  const recent = collectRecentToolsFromDom()
  const viewport = document.querySelector<HTMLElement>('.camera-viewport')
  const hasCompleted = recordingState.segments.length > 0
  const inProgress = recordingState.active && recordingState.segmentStartAt !== null

  if (!hasCompleted && !inProgress) {
    showSidebarFeedback('No recording — press Record to capture first')
    return
  }

  const completedTotal = recordingState.segments.reduce((s, x) => s + x.durationMs, 0)
  let currentElapsed = 0
  if (inProgress && recordingState.segmentStartAt !== null) {
    currentElapsed = Date.now() - recordingState.segmentStartAt
  }

  const payload = {
    app: 'Surgical Vision',
    exportKind: 'recording',
    exportedAt: new Date().toISOString(),
    session: { room: 'OR-7', camera: 'Camera 1' },
    viewport: viewport
      ? { width: Math.round(viewport.clientWidth), height: Math.round(viewport.clientHeight) }
      : null,
    media: {
      format: 'application/json',
      note:
        'Simulated session — no binary video; replace with MPEG-TS/MP4 when backend is wired.',
    },
    recording: {
      segments: [...recordingState.segments],
      ...(inProgress && recordingState.segmentStartAt !== null
        ? {
            inProgress: {
              startedAt: new Date(recordingState.segmentStartAt).toISOString(),
              elapsedMs: currentElapsed,
              paused: recordingState.paused,
            },
          }
        : {}),
    },
    totalRecordedMs: completedTotal + (inProgress ? currentElapsed : 0),
    recentToolsAtExport: recent,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `surgical-vision-recording-${formatFileTimestamp(new Date())}.json`)
  showSidebarFeedback('Recording export saved')
}

function setupSnapshotAndExport(): void {
  document.querySelector('[data-action="snapshot"]')?.addEventListener('click', () => {
    takeSnapshot()
  })
  document.querySelector('[data-action="export-clip"]')?.addEventListener('click', () => {
    exportRecordingJson()
  })
}

function setupRecordingControls(): void {
  document.getElementById('camera-record-btn')?.addEventListener('click', toggleRecording)
  document.getElementById('camera-pause-btn')?.addEventListener('click', togglePause)
  updateRecordingUI()
}

function setupThemeAndProfile(): void {
  const root = document.documentElement
  const KEY = 'theme'

  const apply = (t: 'light' | 'dark') => {
    root.dataset.theme = t
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* ignore */
    }
  }

  const stored = localStorage.getItem(KEY) as 'light' | 'dark' | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  apply(stored ?? (prefersDark ? 'dark' : 'light'))

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      apply(root.dataset.theme === 'dark' ? 'light' : 'dark')
    })
  })

  document.querySelectorAll('.profile-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      /* Profile action — placeholder */
    })
  })
}

setupResizableLayout()
setupBottomPanelTabs()
setupCameraViewportSizeLabel()
setupRecordingControls()
setupSnapshotAndExport()
setupThemeAndProfile()
