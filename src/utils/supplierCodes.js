/**
 * Supplier / factory part numbers must never reach shoppers: the storefront shows
 * Aurex (ATP-…) numbers only. Staff still see the originals and search still matches them.
 *
 * Shapes seen in the catalogue: GL-25300, GL-19113H1, VNTGLB2540, VNRMP-81B-PK2,
 * F05-17C-01 / A20-01S-06, CNCTEC0085, CANVAS-1995-1600, TL-20-2450-2400, OVER600450-LV.
 * Sizes and standards (40mm, 24V, W2450xH2400, VSB12, 3-Way) are deliberately not matched.
 */
const SUPPLIER_CODE = new RegExp(
  '(?<![A-Za-z0-9-])(?:' + [
    'GL-\\d{3,6}[A-Z0-9-]*',
    'VN[A-Z]{0,7}-?\\d[A-Z0-9-]*',
    'CNCTEC\\d+',
    'CANVAS-\\d+(?:-\\d+)*',
    'OVER\\d{4,}-[A-Z]{2}',
    'FZ-\\d{4,6}',
    'PU-\\d+V-\\d+KW',
    'TL-\\d{2}-\\d{4}(?:-\\d{4})?(?:-[A-Z])?',
    '[A-Z]\\d{2}-\\d{2}[A-Z]-\\d{2}'
  ].join('|') + ')(?![A-Za-z0-9])',
  'gi'
);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Codes found in a piece of text (upper-cased, de-duplicated). */
function findSupplierCodes(text) {
  if (typeof text !== 'string' || !text) return [];
  return [...new Set((text.match(SUPPLIER_CODE) || []).map((c) => c.toUpperCase()))];
}

/**
 * Remove supplier codes from display text. `ownCodes` are the part's own stored
 * supplier numbers (OEM / alternate numbers), removed wherever they appear verbatim.
 */
function stripSupplierCodes(text, ownCodes = []) {
  if (typeof text !== 'string' || !text) return text;

  let out = text.replace(SUPPLIER_CODE, ' ');
  for (const code of ownCodes) {
    const c = String(code || '').trim();
    if (c.length < 4 || /^ATP-/i.test(c)) continue;
    out = out.replace(new RegExp(`(^|[^A-Za-z0-9-])${escapeRegExp(c)}(?![A-Za-z0-9])`, 'gi'), '$1 ');
  }

  return out
    .replace(/\(\s*\)|\[\s*\]/g, ' ')                 // "(GL-123)" leaves empty brackets
    .replace(/\s+([,.;:])/g, '$1')                    // no space before punctuation
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g, ''); // stray separators at either end
}

// Typed fragments of the same families ("gl-25", "GL25300", "vntglb", "cnctec00").
const SUPPLIER_PREFIX = /^(?:gl-?\d[a-z0-9-]*|vn[a-z]{2,7}-?\d*[a-z0-9-]*|vn\d[a-z0-9-]*|cnctec\d*|canvas-\d[\d-]*|over\d{3,}[a-z0-9-]*|fz-?\d+|[a-z]\d{2}-\d{2}[a-z]?(?:-\d{0,2})?)$/i;

/** True when a search term is, or is the beginning of, a supplier part number. */
function looksLikeSupplierCode(term) {
  const t = String(term || '').trim();
  if (!t) return false;
  return findSupplierCodes(t).length > 0 || SUPPLIER_PREFIX.test(t.replace(/\s+(?=\d)/g, '')); // "GL 25300" is still GL25300
}

module.exports = { stripSupplierCodes, findSupplierCodes, looksLikeSupplierCode };
