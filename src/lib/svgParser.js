/**
 * Parse an SVG string and extract colorable elements.
 * Returns the parsed DOM and a list of elements with their current colors.
 * Each element stores a reference to its DOM node for later mutation.
 */

let _idCounter = 0;

function nextId() {
  return `el-${_idCounter++}`;
}

export function resetIdCounter() {
  _idCounter = 0;
}

export function parseSVG(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.documentElement;

  if (!svgEl || svgEl.tagName !== 'svg') {
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Il file non è un SVG valido: ' + parseError.textContent);
    }
    throw new Error('Il file non contiene un elemento <svg> valido.');
  }

  const elements = extractColorableElements(svgEl);

  return { doc, svgEl, elements };
}

const COLOR_PROPS = ['fill', 'stroke'];
const SKIP_TAGS = new Set(['metadata', 'title', 'desc', 'script', 'style']);

function extractColorableElements(svgEl) {
  const results = [];
  const idMap = new Map(); // node -> element id

  function walk(node, depth) {
    if (node.nodeType !== 1) return;

    const tagName = node.tagName.toLowerCase();
    if (SKIP_TAGS.has(tagName)) return;

    // Process children of defs but don't add them to editable list
    if (tagName === 'defs') {
      for (const child of node.children) {
        walkDefsOnly(child);
      }
      return;
    }

    const elementInfo = {
      id: nextId(),
      tagName,
      depth,
      fill: null,
      stroke: null,
      _node: node, // store DOM reference
    };

    let hasColor = false;

    // Check attributes
    for (const attr of COLOR_PROPS) {
      const raw = node.getAttribute(attr);
      if (raw && raw !== 'none' && raw !== 'transparent') {
        const color = normalizeColor(raw);
        if (color) {
          elementInfo[attr] = color;
          hasColor = true;
        }
      }
    }

    // Check inline style
    const style = node.getAttribute('style');
    if (style) {
      for (const attr of COLOR_PROPS) {
        const regex = new RegExp(`(?:^|;)\\s*${attr}\\s*:\\s*([^;]+)`, 'i');
        const match = style.match(regex);
        if (match && match[1]) {
          const val = match[1].trim();
          if (val !== 'none' && val !== 'transparent') {
            const color = normalizeColor(val);
            if (color && !elementInfo[attr]) {
              elementInfo[attr] = color;
              hasColor = true;
            }
          }
        }
      }
    }

    if (hasColor) {
      // Build a readable label
      const nodeId = node.getAttribute('id');
      const cls = node.getAttribute('class');
      let label = tagName;
      if (nodeId) label += `#${nodeId}`;
      if (cls) label += `.${cls.split(/\s+/)[0]}`;
      elementInfo.label = label;
      elementInfo._node = node;
      results.push(elementInfo);
    }

    // Recurse into children
    for (const child of node.children) {
      walk(child, depth + 1);
    }
  }

  function walkDefsOnly(node) {
    if (node.nodeType !== 1) return;
    for (const child of node.children) {
      walkDefsOnly(child);
    }
  }

  walk(svgEl, 0);
  return results;
}

// --- Color normalization ---

const NAMED_COLORS = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
  pink: '#ffc0cb', gray: '#808080', grey: '#808080', cyan: '#00ffff',
  magenta: '#ff00ff', lime: '#00ff00', navy: '#000080', teal: '#008080',
  aqua: '#00ffff', maroon: '#800000', olive: '#808000', silver: '#c0c0c0',
  gold: '#ffd700', coral: '#ff7f50', salmon: '#fa8072', tomato: '#ff6347',
  indigo: '#4b0082', violet: '#ee82ee', tan: '#d2b48c', brown: '#a52a2a',
};

function normalizeColor(raw) {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();

  if (trimmed === 'currentcolor' || trimmed === 'inherit' ||
      trimmed.startsWith('url(') || trimmed.startsWith('var(')) {
    return null;
  }

  if (NAMED_COLORS.hasOwnProperty(trimmed)) {
    return NAMED_COLORS[trimmed];
  }

  // Hex
  if (/^#[0-9a-f]{3,8}$/i.test(trimmed)) {
    return expandHex(trimmed);
  }

  // rgb/rgba
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*[,/\s]\s*(\d+)\s*[,/\s]\s*(\d+)\s*(?:[,/\s]\s*[\d.]+)?\s*\)/);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }

  // hsl
  const hslMatch = trimmed.match(/hsla?\s*\(\s*([\d.]+)\s*[,/\s]\s*([\d.]+)%\s*[,/\s]\s*([\d.]+)%/);
  if (hslMatch) {
    return hslToHex(parseFloat(hslMatch[1]), parseFloat(hslMatch[2]) / 100, parseFloat(hslMatch[3]) / 100);
  }

  // Catch: look for any CSS color function
  if (trimmed.includes('(')) return null;

  return null;
}

function expandHex(hex) {
  if (hex.length === 4) {
    return '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  // If 8-char hex (with alpha), strip alpha
  if (hex.length === 9) return hex.slice(0, 7);
  return hex;
}

function rgbToHex(r, g, b) {
  const toHex = (c) => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return rgbToHex(
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255)
  );
}

// --- Apply color edits ---

/**
 * Apply color changes directly to the SVG DOM nodes.
 * Since we stored _node references in each element, we can mutate directly.
 * @param {Array} elements - The elements array (with _node references)
 * @param {Object} edits - Map of elementId -> {property, color}
 * @returns {Document} - The same doc (mutated in place)
 */
export function applyColors(elements, edits) {
  for (const el of elements) {
    if (!el._node) continue;

    // Check fill edit
    const fillEdit = edits[el.id];
    if (fillEdit && fillEdit.property === 'fill') {
      el._node.setAttribute('fill', fillEdit.color);
      updateInlineStyle(el._node, 'fill', fillEdit.color);
    }

    // Check stroke edit
    const strokeKey = el.id + '_stroke';
    const strokeEdit = edits[strokeKey];
    if (strokeEdit && strokeEdit.property === 'stroke') {
      el._node.setAttribute('stroke', strokeEdit.color);
      updateInlineStyle(el._node, 'stroke', strokeEdit.color);
    }
  }
}

function updateInlineStyle(node, prop, color) {
  const style = node.getAttribute('style');
  if (!style) return;
  const regex = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*[^;]+;?`, 'gi');
  const newStyle = style.replace(regex, '');
  const trimmed = newStyle.replace(/;+$/, '').trim();
  const updated = trimmed ? `${trimmed}; ${prop}:${color}` : `${prop}:${color}`;
  node.setAttribute('style', updated);
}

// --- Background ---

export function addBackground(doc, bgColor) {
  if (!bgColor || bgColor === 'transparent' || bgColor === 'none') return;

  const svgEl = doc.documentElement;
  if (!svgEl || svgEl.tagName !== 'svg') return;

  const existing = svgEl.querySelector('rect[data-bg="vettorizza"]');
  if (existing) {
    existing.setAttribute('fill', bgColor);
  } else {
    const bgRect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('data-bg', 'vettorizza');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '0');
    bgRect.setAttribute('width', '100%');
    bgRect.setAttribute('height', '100%');
    bgRect.setAttribute('fill', bgColor);
    // Insert as first child so it's behind everything
    if (svgEl.firstChild) {
      svgEl.insertBefore(bgRect, svgEl.firstChild);
    } else {
      svgEl.appendChild(bgRect);
    }
  }
}

// --- Canvas Rendering ---

export function renderToCanvas(svgString, width, height, bgColor) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const targetWidth = width || 800;
    const targetHeight = height || 600;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw background
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'none') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Impossibile renderizzare il SVG sul canvas.'));
    };

    img.src = url;
  });
}

// --- Download ---

export function downloadPNG(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Impossibile generare il PNG.'));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename || 'vettorizza-export'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

// --- Dimension extraction ---

export function getSVGDimensions(svgString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgEl = doc.documentElement;

  if (!svgEl || svgEl.tagName !== 'svg') return { width: 800, height: 600 };

  const viewBox = svgEl.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
    }
  }

  const w = parseFloat(svgEl.getAttribute('width'));
  const h = parseFloat(svgEl.getAttribute('height'));

  if (w && h && w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };

  return { width: 800, height: 600 };
}
