(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})(),document.querySelector(`#app`).innerHTML=`
<div class="app-shell">
  <header class="titlebar" aria-label="Window title">
    <div class="titlebar-traffic" aria-hidden="true">
      <span class="dot dot-red"></span>
      <span class="dot dot-yellow"></span>
      <span class="dot dot-green"></span>
    </div>
    <span class="titlebar-title">Surgical Vision — Camera</span>
    <div class="titlebar-spacer"></div>
    <div class="titlebar-search" role="search">
      <span>Search tools, sessions…</span>
      <kbd>⌘K</kbd>
    </div>
  </header>

  <div class="workspace">
    <nav class="activity-bar" aria-label="Primary">
      <button type="button" class="activity-btn active" title="Dashboard" aria-current="page">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="3" width="7" height="9" rx="1"/>
          <rect x="14" y="3" width="7" height="5" rx="1"/>
          <rect x="14" y="11" width="7" height="10" rx="1"/>
          <rect x="3" y="15" width="7" height="6" rx="1"/>
        </svg>
      </button>
      <button type="button" class="activity-btn" title="Sessions">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="4" y="4" width="16" height="14" rx="2"/>
          <path d="M4 9h16"/>
        </svg>
      </button>
      <button type="button" class="activity-btn" title="Review">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <path d="M4 9h16"/>
        </svg>
      </button>
      <button type="button" class="activity-btn" title="Settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      </button>
      <div class="activity-spacer"></div>
      <button type="button" class="activity-btn" title="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      </button>
    </nav>

    <aside class="sidebar" aria-label="Navigation">
      <div class="sidebar-header">Workspace</div>
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
          <button type="button" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            Calibration
          </button>
        </li>
        <li>
          <button type="button" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            Case log
          </button>
        </li>
        <li>
          <button type="button" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Compliance
          </button>
        </li>
      </ul>
      <div class="sidebar-section">
        <div class="sidebar-header">Shortcuts</div>
        <ul class="nav-list">
          <li>
            <button type="button" class="nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v2M12 20v2"/>
              </svg>
              Snapshot
            </button>
          </li>
          <li>
            <button type="button" class="nav-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Export clip
            </button>
          </li>
        </ul>
      </div>
      <div class="sidebar-footer">
        OR-7 · Mock feed · UI preview only
      </div>
    </aside>

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
            <button type="button" class="tool-btn">Pause</button>
            <button type="button" class="tool-btn primary">Record</button>
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
            <span class="badge badge-meta">1920×1080 · 30fps</span>
          </div>
          <p class="camera-hint">Camera preview is simulated — connect device to enable capture</p>
        </div>
      </div>

      <section class="bottom-panel" aria-label="Recent detections">
        <div class="panel-tabs" role="tablist">
          <div class="panel-tab active" role="tab" aria-selected="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 6h16M4 12h10M4 18h14"/>
            </svg>
            Recent tools
          </div>
          <div class="panel-tab" role="tab" aria-selected="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M4 19V5M8 5v14M12 5v10M16 5v14M20 5v8"/>
            </svg>
            Timeline
          </div>
          <div class="panel-tab" role="tab" aria-selected="false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Checklist
          </div>
        </div>
        <div class="panel-body">
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
      </section>
    </div>

    <aside class="right-sidebar" aria-label="Tools and status">
      <div class="right-header">Tool library</div>
      <div class="tool-grid">
        <div class="tool-card">
          <div class="tool-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <div class="tool-card-body">
            <h3>Instrument CV</h3>
            <p>Model v2.4 · 127 classes</p>
          </div>
        </div>
        <div class="tool-card">
          <div class="tool-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
          </div>
          <div class="tool-card-body">
            <h3>Zone tracking</h3>
            <p>Sterile field · 4 regions</p>
          </div>
        </div>
        <div class="tool-card">
          <div class="tool-card-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
          </div>
          <div class="tool-card-body">
            <h3>Alerts</h3>
            <p>Missing count · off-field</p>
          </div>
        </div>
      </div>
      <div class="right-divider"></div>
      <div class="status-block">
        <div class="sidebar-header">Session</div>
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
      <div class="status-bar">
        <span>Ready</span><span class="sep">|</span><span>UI mock</span>
      </div>
    </aside>
  </div>
</div>
`;