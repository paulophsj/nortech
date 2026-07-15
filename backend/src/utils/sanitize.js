function sanitizeText(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'e')
    .replace(/[^a-zA-Z0-9\s.,;:!?()\'"@_-]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

module.exports = { sanitizeText };
