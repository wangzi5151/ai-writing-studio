import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export function exportMarkdown(content, filename = 'document') {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${filename}.md`);
}

export function exportHTML(content, filename = 'document') {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.8; 
      color: #333; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 40px 20px;
    }
    h1 { font-size: 2em; margin: 0.67em 0; color: #1a1a1a; }
    h2 { font-size: 1.5em; margin: 0.83em 0; color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h3 { font-size: 1.17em; margin: 1em 0; color: #34495e; }
    p { margin: 1em 0; }
    a { color: #3498db; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #3498db; padding-left: 16px; margin: 1em 0; color: #666; }
    ul, ol { padding-left: 2em; margin: 1em 0; }
    li { margin: 0.5em 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    th { background: #f5f5f5; font-weight: bold; }
    img { max-width: 100%; border-radius: 8px; }
    hr { border: none; border-top: 1px solid #eee; margin: 2em 0; }
  </style>
</head>
<body>
${marked.parse(content)}
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  downloadBlob(blob, `${filename}.html`);
}

export function exportText(content, filename = 'document') {
  const text = content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, (match) => match.replace(/`{3}\w*\n?/g, '').replace(/`{3}/g, ''))
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/>\s/g, '')
    .replace(/[-*]\s/g, '• ')
    .replace(/\n{3,}/g, '\n\n');
  
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${filename}.txt`);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
