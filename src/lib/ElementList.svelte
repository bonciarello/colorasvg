<script>
  let { elements = [], edits = {}, onColorChange } = $props();

  function getColorForElement(el, property) {
    const key = property === 'stroke' ? el.id + '_stroke' : el.id;
    if (edits[key]) return edits[key].color;

    // Return original color or null
    return el[property] || null;
  }

  function handleColorInput(el, property, e) {
    onColorChange(el.id, property, e.target.value);
  }

  function handleResetColor(el, property) {
    onColorChange(el.id, property, el[property] || null);
  }

  function getOriginalColor(el, property) {
    return el[property] || null;
  }
</script>

<div class="element-list" role="list" aria-label="Elementi SVG modificabili">
  {#each elements as el (el.id)}
    <div class="element-row" role="listitem">
      <div class="element-info">
        <span class="element-tag">{el.tagName}</span>
        <span class="element-label">{el.label}</span>
      </div>
      <div class="element-colors">
        {#if el.fill}
          {@const fillVal = getColorForElement(el, 'fill')}
          {@const origFill = getOriginalColor(el, 'fill')}
          <div class="color-field">
            <label for="fill-{el.id}" class="color-field-label">Fill</label>
            <div class="color-field-input">
              <input
                type="color"
                id="fill-{el.id}"
                value={fillVal || origFill || '#000000'}
                oninput={(e) => handleColorInput(el, 'fill', e)}
                class="mini-swatch"
                aria-label="Colore di riempimento per {el.label}"
              />
              {#if fillVal && fillVal !== origFill}
                <button
                  class="reset-color"
                  onclick={() => handleResetColor(el, 'fill')}
                  aria-label="Ripristina colore originale"
                  title="Ripristina originale"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/if}
        {#if el.stroke}
          {@const strokeVal = getColorForElement(el, 'stroke')}
          {@const origStroke = getOriginalColor(el, 'stroke')}
          <div class="color-field">
            <label for="stroke-{el.id}" class="color-field-label">Stroke</label>
            <div class="color-field-input">
              <input
                type="color"
                id="stroke-{el.id}"
                value={strokeVal || origStroke || '#000000'}
                oninput={(e) => handleColorInput(el, 'stroke', e)}
                class="mini-swatch"
                aria-label="Colore del tratto per {el.label}"
              />
              {#if strokeVal && strokeVal !== origStroke}
                <button
                  class="reset-color"
                  onclick={() => handleResetColor(el, 'stroke')}
                  aria-label="Ripristina colore originale"
                  title="Ripristina originale"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .element-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 360px;
    overflow-y: auto;
  }

  .element-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-2);
    border-radius: var(--radius-sm);
    background: transparent;
    transition: background var(--transition-fast);
  }

  .element-row:hover {
    background: var(--color-surface);
  }

  .element-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    flex-shrink: 1;
  }

  .element-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-accent);
    background: var(--color-accent-light);
    padding: 1px 6px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .element-label {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .element-colors {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .color-field {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .color-field-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  .color-field-input {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .mini-swatch {
    width: 28px;
    height: 28px;
    border: 1.5px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    padding: 1px;
    background: transparent;
  }

  .mini-swatch::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .mini-swatch::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }

  .reset-color {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-radius: 3px;
    padding: 0;
    min-height: 20px;
    min-width: 20px;
  }

  .reset-color:hover {
    color: var(--color-primary);
    background: var(--color-primary-light);
  }

  .reset-color:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 1px;
  }
</style>
