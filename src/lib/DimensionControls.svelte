<script>
  let {
    width = 800,
    height = 600,
    lockAspect = true,
    aspectRatio = 1,
    originalWidth = 800,
    originalHeight = 600,
    onWidthChange,
    onHeightChange,
    onLockToggle,
    onReset,
  } = $props();

  function handleWidthInput(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 10000) {
      onWidthChange(val);
    }
  }

  function handleHeightInput(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0 && val <= 10000) {
      onHeightChange(val);
    }
  }

  function handleSliderChange(prop, e) {
    const val = parseInt(e.target.value, 10);
    if (prop === 'width') {
      onWidthChange(val);
    } else {
      onHeightChange(val);
    }
  }

  // Derive slider range
  let minW = $derived(Math.max(1, Math.floor(originalWidth * 0.1)));
  let maxW = $derived(Math.min(10000, Math.ceil(originalWidth * 5)));
  let minH = $derived(Math.max(1, Math.floor(originalHeight * 0.1)));
  let maxH = $derived(Math.min(10000, Math.ceil(originalHeight * 5)));
</script>

<div class="dim-controls">
  <!-- Width -->
  <div class="dim-row">
    <label for="dim-width" class="dim-label">Larghezza</label>
    <div class="dim-input-group">
      <input
        type="range"
        id="dim-width-range"
        min={minW}
        max={maxW}
        value={width}
        oninput={(e) => handleSliderChange('width', e)}
        class="dim-slider"
        aria-label="Regola larghezza"
      />
      <input
        type="number"
        id="dim-width"
        value={width}
        oninput={handleWidthInput}
        onchange={handleWidthInput}
        min="1"
        max="10000"
        class="dim-number"
        aria-label="Larghezza in pixel"
      />
      <span class="dim-unit">px</span>
    </div>
  </div>

  <!-- Height -->
  <div class="dim-row">
    <label for="dim-height" class="dim-label">Altezza</label>
    <div class="dim-input-group">
      <input
        type="range"
        id="dim-height-range"
        min={minH}
        max={maxH}
        value={height}
        oninput={(e) => handleSliderChange('height', e)}
        class="dim-slider"
        aria-label="Regola altezza"
      />
      <input
        type="number"
        id="dim-height"
        value={height}
        oninput={handleHeightInput}
        onchange={handleHeightInput}
        min="1"
        max="10000"
        class="dim-number"
        aria-label="Altezza in pixel"
      />
      <span class="dim-unit">px</span>
    </div>
  </div>

  <!-- Lock & Reset -->
  <div class="dim-actions">
    <button
      class="lock-btn"
      onclick={onLockToggle}
      aria-label={lockAspect ? 'Sblocca proporzioni' : 'Blocca proporzioni'}
      aria-pressed={lockAspect}
      title={lockAspect ? 'Proporzioni bloccate' : 'Proporzioni libere'}
    >
      {#if lockAspect}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      {:else}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </svg>
      {/if}
      <span>{lockAspect ? 'Bloccato' : 'Libero'}</span>
    </button>
    <button
      class="reset-btn"
      onclick={onReset}
      aria-label="Ripristina dimensioni originali"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
      Originali
    </button>
  </div>

  <!-- Dimension info -->
  <div class="dim-info">
    <span class="dim-info-text">Originale: {originalWidth} &times; {originalHeight} px</span>
  </div>
</div>

<style>
  .dim-controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .dim-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .dim-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .dim-input-group {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .dim-slider {
    flex: 1;
    height: 6px;
    -webkit-appearance: none;
    appearance: none;
    background: var(--color-border);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    min-width: 0;
  }

  .dim-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .dim-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .dim-slider:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .dim-number {
    width: 68px;
    min-height: 36px;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text);
    text-align: right;
    background: var(--color-panel);
    transition: border-color var(--transition-fast);
  }

  .dim-number:focus {
    border-color: var(--color-border-focus);
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  .dim-unit {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    font-weight: 500;
    min-width: 20px;
  }

  .dim-actions {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .lock-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-panel);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .lock-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .lock-btn[aria-pressed="true"] {
    background: var(--color-primary-light);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .lock-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .reset-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    padding: var(--space-1) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-panel);
    font-family: var(--font-body);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .reset-btn:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .reset-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .dim-info {
    padding-top: var(--space-1);
  }

  .dim-info-text {
    font-size: 10px;
    color: var(--color-text-secondary);
    opacity: 0.6;
  }
</style>
