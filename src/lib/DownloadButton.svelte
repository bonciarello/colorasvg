<script>
  let { onclick, disabled = false, loading = false } = $props();
</script>

<button
  class="download-btn"
  {onclick}
  disabled={disabled || loading}
  aria-label="Scarica il PNG"
  aria-busy={loading}
>
  {#if loading}
    <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    <span>Esportazione in corso…</span>
  {:else}
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    <span>Scarica PNG</span>
  {/if}
</button>

<style>
  .download-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-height: 48px;
    width: 100%;
    padding: var(--space-3) var(--space-5);
    background: var(--color-primary);
    color: #fff;
    font-family: var(--font-display);
    font-size: var(--text-base);
    font-weight: 600;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--transition-fast), transform var(--transition-fast), opacity var(--transition-fast);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
  }

  .download-btn:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
  }

  .download-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .download-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .download-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 3px;
  }

  .spinner {
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
