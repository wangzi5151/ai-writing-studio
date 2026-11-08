import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../utils/markdown';

describe('renderMarkdown', () => {
  it('renders normal markdown', () => {
    const html = renderMarkdown('# Title\n\n**bold** and [link](https://example.com)');

    expect(html).toContain('<h1');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('href="https://example.com"');
  });

  it('removes scripts, event handlers and javascript URLs', () => {
    const html = renderMarkdown([
      '# Safe',
      '<script>window.pwned = 1</script>',
      '<img src="x" onerror="window.pwned = 2">',
      '[click](javascript:alert(1))'
    ].join('\n\n'));

    expect(html).toContain('Safe');
    expect(html).not.toMatch(/<script/i);
    expect(html).not.toMatch(/onerror/i);
    expect(html).not.toMatch(/javascript:/i);
  });
});
