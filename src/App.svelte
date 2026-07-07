<script>
  import { parseSVG, applyColors, renderToCanvas, downloadPNG, getSVGDimensions } from './lib/svgParser.js';
  import DropZone from './lib/DropZone.svelte';
  import ElementList from './lib/ElementList.svelte';
  import DimensionControls from './lib/DimensionControls.svelte';
  import PreviewCanvas from './lib/PreviewCanvas.svelte';
  import DownloadButton from './lib/DownloadButton.svelte';

  let svgDoc = $state(null);
  let svgElements = $state([]);
  let fileName = $state('');

  let renderVersion = $state(0);

  // Dimensions
  let width = $state(800);
  let height = $state(600);
  let originalWidth = $state(800);
  let originalHeight = $state(600);
  let lockAspect = $state(true);
  let aspectRatio = $state(1);

  // Background
  let bgColor = $state('#FFFFFF');

  // Edits: map elementId -> { property: 'fill'|'stroke', color }
  let edits = $state({});

  // Preview state
  let previewCanvas = $state(null);
  let previewError = $state(null);
  let isRendering = $state(false);

  // Status toast
  let statusMessage = $state('');
  let statusType = $state('');

  function showStatus(msg, type = 'success') {
    statusMessage = msg;
    statusType = type;
    setTimeout(() => { statusMessage = ''; }, 3000);
  }

  function handleFileLoaded(text, name) {
    try {
      const { doc, svgEl, elements } = parseSVG(text);
      svgDoc = doc;
      svgElements = elements;
      fileName = name || 'immagine';

      const dims = getSVGDimensions(text);
      originalWidth = dims.width;
      originalHeight = dims.height;
      width = dims.width;
      height = dims.height;
      aspectRatio = dims.width / (dims.height || 1);

      // Reset edits
      edits = {};

      // Build initial edits from parsed elements
      const initial = {};
      for (const el of elements) {
        if (el.fill) {
          initial[el.id] = { property: 'fill', color: el.fill };
        }
        if (el.stroke) {
          initial[el.id + '_stroke'] = { property: 'stroke', color: el.stroke };
        }
      }
      edits = initial;

      previewError = null;
      renderVersion++;
      showStatus(`SVG caricato: ${elements.length} elementi modificabili.`);
    } catch (err) {
      previewError = err.message;
      showStatus(err.message, 'error');
    }
  }

  function handleColorChange(elementId, property, color) {
    const key = property === 'stroke' ? elementId + '_stroke' : elementId;
    let newEdits = { ...edits };

    // Remove any existing edit for this element + property combo
    // (either fill or stroke for this element)
    if (property === 'fill') {
      delete newEdits[elementId + '_stroke'];
      if (color === null || color === '') {
        delete newEdits[elementId];
      } else {
        newEdits[elementId] = { property: 'fill', color };
      }
    } else {
      delete newEdits[elementId];
      if (color === null || color === '') {
        delete newEdits[elementId + '_stroke'];
      } else {
        newEdits[elementId + '_stroke'] = { property: 'stroke', color };
      }
    }

    edits = newEdits;
    renderVersion++;
  }

  function handleWidthChange(w) {
    if (lockAspect) {
      width = w;
      height = Math.round(w / aspectRatio);
    } else {
      width = w;
    }
    renderVersion++;
  }

  function handleHeightChange(h) {
    if (lockAspect) {
      height = h;
      width = Math.round(h * aspectRatio);
    } else {
      height = h;
    }
    renderVersion++;
  }

  function handleLockToggle() {
    lockAspect = !lockAspect;
    if (lockAspect) {
      aspectRatio = width / (height || 1);
    }
  }

  function handleBgChange(color) {
    bgColor = color;
    renderVersion++;
  }

  async function handleDownload() {
    if (!svgDoc) return;
    isRendering = true;
    try {
      // Apply color edits to DOM nodes
      applyColors(svgElements, edits);

      // Serialize to string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgDoc);

      // Render to canvas (background is handled by the canvas drawing)
      const canvas = await renderToCanvas(svgString, width, height, bgColor);

      // Download
      await downloadPNG(canvas, fileName.replace(/\.[^.]+$/, ''));
      showStatus('PNG scaricato con successo!');
    } catch (err) {
      showStatus(err.message, 'error');
    } finally {
      isRendering = false;
    }
  }

  // Re-render preview whenever renderVersion changes
  $effect(() => {
    if (!svgDoc) return;
    const version = renderVersion;
    let cancelled = false;

    async function updatePreview() {
      try {
        // Apply color edits directly on DOM nodes
        applyColors(svgElements, edits);

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgDoc);

        const canvas = await renderToCanvas(svgString, width, height, bgColor);
        if (cancelled) return;
        previewCanvas = canvas;
        previewError = null;
      } catch (err) {
        if (cancelled) return;
        previewError = err.message;
      }
    }

    updatePreview();
    return () => { cancelled = true; };
  });

  function handleReset() {
    svgDoc = null;
    svgElements = [];
    previewCanvas = null;
    edits = {};
    previewError = null;
    width = 800;
    height = 600;
    bgColor = '#FFFFFF';
    fileName = '';
    renderVersion = 0;
  }
</script>

<header class="app-header">
  <div class="header-inner">
    <div class="logo-area">
      <svg class="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
      <span class="logo-text">Vettorizza</span>
    </div>
    <p class="header-tagline">Converti SVG in PNG. Modifica colori e dimensioni, tutto nel browser.</p>
  </div>
</header>

<main class="app-main">
  {#if !svgDoc}
    <section class="upload-section" aria-label="Carica il tuo SVG">
      <DropZone onFileLoaded={handleFileLoaded} />
      <div class="upload-hint">
        <p>Trascina qui un file SVG, oppure clicca per caricarlo. Nessun upload su server — tutto rimane sul tuo dispositivo.</p>
      </div>
    </section>
  {:else}
    <div class="workspace">
      <!-- Sidebar: Editor controls -->
      <aside class="sidebar" aria-label="Pannello di modifica">
        <div class="sidebar-section">
          <h2 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Colori elementi
          </h2>
          {#if svgElements.length === 0}
            <p class="empty-message">Nessun elemento con colore modificabile trovato in questo SVG.</p>
          {:else}
            <ElementList
              elements={svgElements}
              edits={edits}
              onColorChange={handleColorChange}
            />
          {/if}
        </div>

        <div class="sidebar-section">
          <h2 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            Dimensioni
          </h2>
          <DimensionControls
            {width}
            {height}
            {lockAspect}
            {aspectRatio}
            {originalWidth}
            {originalHeight}
            onWidthChange={handleWidthChange}
            onHeightChange={handleHeightChange}
            onLockToggle={handleLockToggle}
            onReset={() => {
              width = originalWidth;
              height = originalHeight;
              renderVersion++;
            }}
          />
        </div>

        <div class="sidebar-section">
          <h2 class="section-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="2" />
              <path d="M2 12h20" /><path d="M12 2v20" />
            </svg>
            Sfondo
          </h2>
          <div class="bg-controls">
            <div class="color-picker-row">
              <input
                type="color"
                id="bgColor"
                value={bgColor === 'transparent' || bgColor === 'none' ? '#FFFFFF' : bgColor}
                oninput={(e) => handleBgChange(e.target.value)}
                class="color-swatch"
                aria-label="Colore di sfondo"
              />
              <label for="bgColor" class="color-label">Sfondo anteprima</label>
            </div>
            <button
              class="btn-ghost btn-sm"
              onclick={() => handleBgChange('transparent')}
              aria-label="Sfondo trasparente"
            >
              Trasparente
            </button>
          </div>
        </div>

        <div class="sidebar-actions">
          <DownloadButton
            onclick={handleDownload}
            disabled={!svgDoc || isRendering}
            loading={isRendering}
          />
          <button
            class="btn-ghost"
            onclick={handleReset}
            aria-label="Carica un nuovo SVG"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Nuovo SVG
          </button>
        </div>
      </aside>

      <!-- Main: Preview area -->
      <section class="preview-area" aria-label="Anteprima">
        <div class="preview-header">
          <span class="eyebrow">Anteprima</span>
          <span class="file-badge">{fileName}</span>
        </div>
        <PreviewCanvas
          canvas={previewCanvas}
          error={previewError}
          {width}
          {height}
          {bgColor}
        />
      </section>
    </div>
  {/if}
</main>

<footer class="app-footer">
  <p>Vettorizza &mdash; elaborazione completamente locale. I tuoi file non lasciano mai il tuo dispositivo.</p>
</footer>

{#if statusMessage}
  <div
    class="toast toast-{statusType}"
    role="status"
    aria-live="polite"
  >
    {statusMessage}
  </div>
{/if}

<style>
  .app-header {
    background: var(--color-panel);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-4) var(--space-6);
  }

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .logo-icon {
    flex-shrink: 0;
  }

  .logo-text {
    font-family: var(--font-display);
    font-size: var(--text-xl);
    font-weight: 700;
    line-height: 1.2;
    color: var(--color-text);
  }

  .header-tagline {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  .app-main {
    max-width: 1400px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-6);
    min-height: calc(100vh - 140px);
  }

  .upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    padding-top: var(--space-12);
  }

  .upload-hint {
    text-align: center;
    max-width: 420px;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .workspace {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: var(--space-6);
    align-items: start;
  }

  .sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .sidebar-section {
    background: var(--color-panel);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);
  }

  .section-title {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    letter-spacing: -0.01em;
  }

  .empty-message {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    font-style: italic;
  }

  .bg-controls {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .color-picker-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .color-swatch {
    width: 36px;
    height: 36px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    padding: 2px;
    background: transparent;
  }

  .color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
  .color-swatch::-webkit-color-swatch { border: none; border-radius: 3px; }

  .color-label {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .btn-ghost:hover {
    background: var(--color-primary-light);
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .btn-ghost:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .btn-sm {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-xs);
    min-height: 32px;
  }

  .sidebar-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .preview-area {
    position: sticky;
    top: var(--space-4);
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .eyebrow {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-primary);
  }

  .file-badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    background: var(--color-panel);
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border);
  }

  .app-footer {
    text-align: center;
    padding: var(--space-4) var(--space-6);
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    border-top: 1px solid var(--color-border);
    background: var(--color-panel);
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    font-weight: 500;
    color: #fff;
    z-index: 1000;
    box-shadow: var(--shadow-lg);
    animation: toast-in var(--transition-base) ease-out;
  }

  .toast-success { background: var(--color-success); }
  .toast-error { background: var(--color-error); }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 800px) {
    .workspace { grid-template-columns: 1fr; }
    .preview-area { position: static; }
    .header-inner { flex-direction: column; align-items: flex-start; }
    .app-main { padding: var(--space-3); }
  }
</style>
