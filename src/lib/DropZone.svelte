<script>
  let { onFileLoaded } = $props();

  let isDragging = $state(false);
  let error = $state('');

  function handleDragOver(e) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    isDragging = false;
  }

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  }

  function handleFileInput(e) {
    const file = e.target?.files?.[0];
    if (file) processFile(file);
  }

  function processFile(file) {
    error = '';
    if (!file.name.toLowerCase().endsWith('.svg')) {
      error = 'Per favore carica un file SVG (.svg).';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      if (typeof text === 'string') {
        onFileLoaded(text, file.name);
      }
    };
    reader.onerror = () => {
      error = 'Errore nella lettura del file. Riprova.';
    };
    reader.readAsText(file);
  }
</script>

<div
  class="dropzone"
  class:dropzone-active={isDragging}
  role="region"
  aria-label="Carica file SVG"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  <div class="dropzone-inner">
    <svg class="dropzone-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
      <polyline points="2 8.5 12 2 22 8.5" />
    </svg>
    <p class="dropzone-title">Trascina il tuo SVG qui</p>
    <p class="dropzone-subtitle">oppure</p>
    <label class="dropzone-btn" for="file-input">
      Scegli file SVG
    </label>
    <input
      id="file-input"
      type="file"
      accept=".svg,image/svg+xml"
      class="sr-only"
      onchange={handleFileInput}
      aria-label="Scegli un file SVG dal tuo computer"
    />
  </div>
  {#if error}
    <p class="dropzone-error" role="alert">{error}</p>
  {/if}
</div>

<style>
  .dropzone {
    width: 100%;
    max-width: 480px;
    border: 2px dashed var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-dropzone);
    padding: var(--space-8) var(--space-6);
    transition: border-color var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
    cursor: pointer;
  }

  .dropzone:hover {
    border-color: var(--color-primary);
    background: #F0EBFF;
  }

  .dropzone-active {
    border-color: var(--color-primary);
    background: #EDE4FF;
    transform: scale(1.01);
  }

  .dropzone-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    text-align: center;
  }

  .dropzone-icon {
    color: var(--color-primary);
    opacity: 0.7;
    margin-bottom: var(--space-1);
  }

  .dropzone-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-text);
  }

  .dropzone-subtitle {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .dropzone-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: var(--space-2) var(--space-5);
    background: var(--color-primary);
    color: #fff;
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: 600;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .dropzone-btn:hover {
    background: var(--color-primary-hover);
  }

  .dropzone-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  .dropzone-error {
    margin-top: var(--space-3);
    text-align: center;
    color: var(--color-error);
    font-size: var(--text-sm);
    font-weight: 500;
    background: var(--color-error-light);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
  }
</style>
