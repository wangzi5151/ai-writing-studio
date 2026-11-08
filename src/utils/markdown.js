import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  breaks: true,
  gfm: true
});

const SANITIZE_CONFIG = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'onmouseover', 'srcdoc']
};

/**
 * Parse Markdown and sanitize the resulting HTML. Rendering is done locally
 * (marked is bundled) and the HTML is passed through DOMPurify so preview and
 * HTML export never execute untrusted markup.
 */
export function renderMarkdown(text) {
  if (!text) return '';
  const raw = marked.parse(text);
  return DOMPurify.sanitize(raw, SANITIZE_CONFIG);
}

export { marked };
