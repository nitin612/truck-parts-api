/**
 * Defensive XSS Sanitizer for User-Generated Content
 * Neutralizes HTML script injection, inline event handlers (onerror, onload, etc.),
 * and malicious URI schemes (javascript:, data:) before persistence.
 */

const DANGEROUS_PATTERNS = [
  /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
  /<\s*iframe[^>]*>[\s\S]*?<\s*\/\s*iframe\s*>/gi,
  /<\s*object[^>]*>[\s\S]*?<\s*\/\s*object\s*>/gi,
  /<\s*embed[^>]*>[\s\S]*?<\s*\/\s*embed\s*>/gi,
  /<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi,
  /<\s*(link|meta|base|form|input|button)[^>]*>/gi,
  /\bon\w+\s*=\s*(['"]).*?\1/gi,
  /\bon\w+\s*=\s*[^>\s]+/gi,
  /javascript\s*:\s*[^\s"'>]+/gi,
  /vbscript\s*:\s*[^\s"'>]+/gi,
  /data\s*:\s*text\/html[^\s"'>]+/gi,
];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let clean = str;
  for (const pattern of DANGEROUS_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Replace unclosed opening tags that resemble script/iframe
  clean = clean.replace(/<\s*(script|iframe|object|embed)/gi, '');
  return clean.trim();
}

function sanitizeFields(target, fieldList) {
  if (!target || typeof target !== 'object') return target;
  for (const field of fieldList) {
    if (typeof target[field] === 'string') {
      target[field] = sanitizeString(target[field]);
    }
  }
  return target;
}

module.exports = {
  sanitizeString,
  sanitizeFields,
};
