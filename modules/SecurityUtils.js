// Security utilities: text/url sanitization and safe element creation
export class SecurityUtils {
  sanitizeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  sanitizeUrl(url) {
    if (!url) return '';
    if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) return '';
    return url;
  }
  createSecureElement(tagName, textContent = '', className = '') {
    const el = document.createElement(tagName);
    if (textContent) el.textContent = textContent;
    if (className) el.className = className;
    return el;
  }
}


