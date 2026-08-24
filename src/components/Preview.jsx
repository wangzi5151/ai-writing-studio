import React, { useMemo } from 'react';
import { renderMarkdown } from '../utils/markdown';

export default function Preview({ content }) {
  const html = useMemo(() => renderMarkdown(content), [content]);
  
  return (
    <div className="h-full overflow-auto p-6">
      <div 
        className="markdown-preview"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
