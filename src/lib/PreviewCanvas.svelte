<script>
  let { canvas = null, error = null, width = 800, height = 600, bgColor = '#FFFFFF' } = $props();

  let canvasContainer = $state(null);

  $effect(() => {
    if (!canvasContainer || !canvas) return;
    // Clear container
    canvasContainer.innerHTML = '';
    canvasContainer.appendChild(canvas);
  });
</script>

<div class="preview-wrapper" style="background: {bgColor === 'transparent' ? 'transparent' : bgColor};">
  {#if error}
    <div class="preview-error" role="alert">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p>{error}</p>
    </div>
  {:else if canvas}
    <div
      bind:this={canvasContainer}
      class="preview-canvas-container"
    ></div>
  {:else}
    <div class="preview-placeholder">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <p>In attesa del render...</p>
    </div>
  {/if}
</div>

<div class="preview-meta">
  <span class="preview-size">{width} &times; {height} px</span>
  {#if bgColor !== 'transparent'}
    <span class="preview-bg-dot" style="background: {bgColor};" aria-hidden="true"></span>
    <span class="preview-bg-label">{bgColor}</span>
  {/if}
</div>

<style>
  .preview-wrapper {
    position: relative;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-canvas);
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--color-border);

    /* Checkerboard for transparent bg */
    background-image: linear-gradient(45deg, #e5e5e5 25%, transparent 25%),
                      linear-gradient(-45deg, #e5e5e5 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #e5e5e5 75%),
                      linear-gradient(-45deg, transparent 75%, #e5e5e5 75%);
    background-size: 16px 16px;
    background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
    transition: background var(--transition-base);
  }

  .preview-wrapper:has(.preview-canvas-container) {
    /* Background handled by inline style for solid bg */
  }

  .preview-canvas-container {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-canvas-container :global(canvas) {
    max-width: 100%;
    height: auto;
    display: block;
  }

  .preview-placeholder,
  .preview-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-8);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .preview-error {
    color: var(--color-error);
  }

  .preview-error p {
    font-size: var(--text-sm);
    max-width: 300px;
  }

  .preview-placeholder p {
    font-size: var(--text-sm);
  }

  .preview-meta {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
    padding: 0 var(--space-1);
  }

  .preview-size {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }

  .preview-bg-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .preview-bg-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }
</style>
