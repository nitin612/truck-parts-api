// User text must never be used as a raw pattern: characters like ( * + can make MongoDB
// throw (500) or backtrack for seconds. Escape it and cap the length before building a $regex.
const escapeRegExp = (text, maxLength = 100) =>
  String(text ?? '').slice(0, maxLength).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = escapeRegExp;
