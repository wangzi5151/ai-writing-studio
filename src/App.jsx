import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

const TEMPLATES = {
  blank: { name: 'Blank', content: '' },
  blog: {
    name: 'Blog Post',
    content: '# Blog Title\n\n## Introduction\n\nWrite your introduction here...\n\n## Main Content\n\n### Subheading\n\nYour content here...\n\n## Conclusion\n\nWrap up your thoughts here...',
  },
  email: {
    name: 'Email',
    content: '# Subject:\n\nDear [Name],\n\nI hope this email finds you well.\n\n[Body]\n\nBest regards,\n[Your Name]',
  },
  resume: {
    name: 'Resume',
    content: '# [Your Name]\n\n## Contact\n- Email: your.email@example.com\n- Phone: (555) 123-4567\n\n## Experience\n\n### Job Title - Company Name\n*Date Range*\n- Achievement 1\n- Achievement 2\n\n## Education\n\n### Degree - Institution\n*Graduation Date*',
  },
  essay: {
    name: 'Essay',
    content: '# Essay Title\n\n## Introduction\n\nHook the reader with an interesting opening...\n\n## Body Paragraph 1\n\nTopic sentence and supporting details...\n\n## Body Paragraph 2\n\nAnother perspective or argument...\n\n## Conclusion\n\nSummarize your main points...',
  },
  meeting: {
    name: 'Meeting Notes',
    content: '# Meeting Notes - [Date]\n\n## Attendees\n- Person 1\n- Person 2\n\n## Agenda\n1. Item 1\n2. Item 2\n\n## Discussion\n\nNotes from discussion...\n\n## Action Items\n- [ ] Task 1 - Assigned to\n- [ ] Task 2 - Assigned to\n\n## Next Meeting\n[Date/Time]',
  },
  todo: {
    name: 'Todo List',
    content: '# Todo List\n\n## High Priority\n- [ ] Task 1\n- [ ] Task 2\n\n## Medium Priority\n- [ ] Task 3\n- [ ] Task 4\n\n## Low Priority\n- [ ] Task 5\n- [ ] Task 6',
  },
  idea: {
    name: 'Idea Capture',
    content: '# Idea: [Title]\n\n## Problem\nWhat problem does this solve?\n\n## Solution\nHow would you solve it?\n\n## Benefits\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\n## Next Steps\n1. Step 1\n2. Step 2',
  },
};

const AI_MODES = [
  { id: 'polish', name: 'Polish', desc: 'Improve grammar and clarity' },
  { id: 'expand', name: 'Expand', desc: 'Add more detail and content' },
  { id: 'shorten', name: 'Shorten', desc: 'Make more concise' },
  { id: 'translate', name: 'Translate', desc: 'Translate to another language' },
  { id: 'summarize', name: 'Summarize', desc: 'Create a summary' },
  { id: 'continue', name: 'Continue', desc: 'Continue writing' },
  { id: 'formal', name: 'Formal', desc: 'Make more professional' },
  { id: 'creative', name: 'Creative', desc: 'Add creative flair' },
];

const AI_PROMPTS = {
  polish: 'Polish this text for grammar, clarity, and flow. Fix errors and improve readability while maintaining the original meaning:',
  expand: 'Expand this text with more details, examples, and explanations. Make it more comprehensive:',
  shorten: 'Shorten this text while keeping the key information. Make it more concise:',
  translate: 'Translate this text to English. If already in English, translate to Spanish:',
  summarize: 'Create a concise summary of this text highlighting the main points:',
  continue: 'Continue writing from this text. Maintain the same style and tone:',
  formal: 'Rewrite this text in a more formal, professional tone:',
  creative: 'Rewrite this text with more creative and engaging language:',
};

function useAI() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const processText = useCallback(async (text, mode, customPrompt) => {
    if (!window.puter) {
      setError('AI service not available. Please check your connection.');
      return null;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const prompt = customPrompt || AI_PROMPTS[mode] || AI_PROMPTS.polish;
      const response = await window.puter.ai.chat(prompt + '\n\n' + text);
      setIsProcessing(false);
      return response;
    } catch (err) {
      setIsProcessing(false);
      setError('Failed to process text. Please try again.');
      return null;
    }
  }, []);

  return { processText, isProcessing, error };
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('LocalStorage error');
    }
  }, [key, value]);

  return [value, setValue];
}


function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={'fixed top-4 right-4 z-[100] ' + bg + ' text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3'} style={{ animation: 'slideIn 0.3s ease-out' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {type === 'success' && <polyline points="20 6 9 17 4 12" />}
        {type === 'error' && (<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>)}
        {type === 'info' && (<><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></>)}
      </svg>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75 transition-opacity">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
  );
}

function TemplateModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.2s ease-out' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Choose Template</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start with a pre-built layout</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.keys(TEMPLATES).map(key => (
            <button key={key} onClick={() => { onSelect(TEMPLATES[key].content); onClose(); }}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 dark:text-indigo-400 mb-2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                {key === 'blog' && (<><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>)}
                {key === 'todo' && (<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>)}
                {key === 'resume' && (<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>)}
                {key === 'meeting' && (<><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>)}
                {key === 'idea' && (<path d="M12 2a7 7 0 0 0-4 12.73V17h8v-2.27A7 7 0 0 0 12 2z" />)}
                {key === 'email' && (<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />)}
                {key === 'essay' && (<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>)}
                {key === 'blank' && (<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>)}
              </svg>
              <div className="font-semibold text-gray-900 dark:text-white text-sm">{TEMPLATES[key].name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExportModal({ content, title, onClose, onToast }) {
  const doExport = (format) => {
    let blob, filename;
    const html = window.marked ? window.marked.parse(content) : content;

    if (format === 'markdown') {
      blob = new Blob([content], { type: 'text/markdown' });
      filename = (title || 'document') + '.md';
    } else if (format === 'html') {
      const full = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:0 auto;padding:2rem;line-height:1.7;color:#333}h1,h2,h3{color:#1a1a2e}code{background:#f0f0f0;padding:2px 6px;border-radius:4px}pre{background:#1a1a2e;color:#e0e0e0;padding:1rem;border-radius:8px;overflow-x:auto}blockquote{border-left:4px solid #6366f1;margin:0;padding-left:1rem;color:#555}a{color:#6366f1}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head><body>' + html + '</body></html>';
      blob = new Blob([full], { type: 'text/html' });
      filename = (title || 'document') + '.html';
    } else if (format === 'text') {
      const text = content.replace(/[#*_`~\[\]]/g, '');
      blob = new Blob([text], { type: 'text/plain' });
      filename = (title || 'document') + '.txt';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast('Exported as ' + format.toUpperCase(), 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'scaleIn 0.2s ease-out' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div className="space-y-3">
          {[
            { fmt: 'markdown', label: 'Markdown', sub: '.md file', iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
            { fmt: 'html', label: 'HTML', sub: 'Web page format', iconPath: 'M13.5 6.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z' },
            { fmt: 'text', label: 'Plain Text', sub: '.txt file', iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
          ].map(item => (
            <button key={item.fmt} onClick={() => doExport(item.fmt)}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-left flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                <path d={item.iconPath} />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{item.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ darkMode, setDarkMode, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm h-full shadow-2xl p-6 overflow-y-auto border-l border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'slideFromRight 0.3s ease-out' }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
                  {darkMode ? (<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></>) : (<><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>)}
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">Dark Mode</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme</div>
              </div>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={'w-12 h-6 rounded-full transition-colors relative ' + (darkMode ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600')}>
              <div className={'w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ' + (darkMode ? 'translate-x-[26px]' : 'translate-x-0.5')} />
            </button>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <div className="font-semibold text-gray-900 dark:text-white mb-3">About</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>AI Writing Studio v1.0</p>
              <p>A beautiful markdown editor with AI-powered writing assistance.</p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 pt-6">
            <div className="font-semibold text-gray-900 dark:text-white mb-3">Keyboard Shortcuts</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <div className="flex justify-between"><span>Save document</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd></div>
              <div className="flex justify-between"><span>New document</span><kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+N</kbd></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ documents, currentId, onSelect, onNew, onDelete, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-start" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-sm h-full shadow-2xl flex flex-col border-r border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'slideFromLeft 0.3s ease-out' }}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Documents</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="p-4">
          <button onClick={() => { onNew(); onClose(); }}
            className="w-full p-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 font-semibold text-sm shadow-lg shadow-indigo-500/25">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            New Document
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
          {documents.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">No documents yet</div>
          )}
          {documents.map(doc => (
            <div key={doc.id} onClick={() => { onSelect(doc.id); onClose(); }}
              className={'p-3 rounded-xl cursor-pointer transition-all flex items-center justify-between group ' + (doc.id === currentId ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent')}>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white text-sm truncate">{doc.title || 'Untitled'}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{new Date(doc.updatedAt).toLocaleDateString()}</div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIPanel({ content, onApply, onClose, onToast }) {
  const { processText, isProcessing, error } = useAI();
  const [selectedMode, setSelectedMode] = useState('polish');
  const [customPrompt, setCustomPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleProcess = async () => {
    if (!content || !content.trim()) {
      onToast('No text to process', 'error');
      return;
    }
    const output = await processText(content, selectedMode, customPrompt);
    if (output) {
      setResult(typeof output === 'string' ? output : JSON.stringify(output));
    }
  };

  const handleApply = () => {
    if (result) {
      onApply(result);
      onToast('AI text applied to editor', 'success');
      setResult('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()} style={{ animation: 'slideFromRight 0.3s ease-out' }}>
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">AI Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {AI_MODES.map(mode => (
                <button key={mode.id} onClick={() => { setSelectedMode(mode.id); setCustomPrompt(''); }}
                  className={'p-3 rounded-xl text-left transition-all text-sm ' + (selectedMode === mode.id ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500 dark:border-indigo-400' : 'border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600')}>
                  <div className="font-semibold text-gray-900 dark:text-white">{mode.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom Prompt (optional)</label>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Override the default prompt..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
            />
          </div>

          <button onClick={handleProcess} disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25">
            {isProcessing ? (
              <><svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg> Processing...</>
            ) : (
              <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg> Run AI</>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">{error}</div>
          )}

          {result && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Result</label>
                <button onClick={handleApply} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors">Apply to Editor</button>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">{result}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Editor({ content, onChange, editorRef }) {
  const textareaRef = useRef(null);
  const cmRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && !cmRef.current && window.CodeMirror) {
      cmRef.current = window.CodeMirror.fromTextArea(textareaRef.current, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: document.documentElement.classList.contains('dark') ? 'monokai' : 'default',
        extraKeys: {
          'Ctrl-S': function() {},
          'Cmd-S': function() {},
        },
      });

      cmRef.current.on('change', () => {
        const val = cmRef.current.getValue();
        onChange(val);
      });

      if (editorRef) editorRef.current = cmRef.current;
    }
  }, []);

  useEffect(() => {
    if (cmRef.current && cmRef.current.getValue() !== content) {
      cmRef.current.setValue(content || '');
    }
  }, [content]);

  useEffect(() => {
    if (cmRef.current) {
      const isDark = document.documentElement.classList.contains('dark');
      cmRef.current.setOption('theme', isDark ? 'monokai' : 'default');
    }
  });

  return (
    <div className="h-full">
      <textarea ref={textareaRef} defaultValue={content || ''} className="hidden" />
      <style>{`
        .CodeMirror { height: 100% !important; font-size: 15px; font-family: 'JetBrains Mono', 'Fira Code', monospace; border-radius: 0; }
        .cm-s-default .cm-header { color: #1a1a2e; font-weight: bold; }
        .cm-s-default .cm-em { font-style: italic; }
        .cm-s-default .cm-strong { font-weight: bold; }
        .cm-s-monokai .cm-header { color: #f8f8f2; font-weight: bold; }
        .cm-s-monokai .cm-em { font-style: italic; color: #ae81ff; }
        .cm-s-monokai .cm-strong { font-weight: bold; color: #a6e22e; }
      `}</style>
    </div>
  );
}

function Preview({ content }) {
  const html = useMemo(() => {
    if (!content) return '<p class="text-gray-400 dark:text-gray-500 italic">Nothing to preview yet...</p>';
    if (window.marked) {
      try {
        return window.marked.parse(content);
      } catch {
        return '<p class="text-red-500">Error parsing markdown</p>';
      }
    }
    return '<p class="text-gray-400">Markdown library not loaded</p>';
  }, [content]);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8">
      <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-indigo-500 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-indigo-500 dark:prose-code:text-indigo-400 prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-blockquote:border-indigo-500"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

export default function App() {
  const [documents, setDocuments] = useLocalStorage('ai-studio-docs', []);
  const [currentId, setCurrentId] = useState(null);
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [toast, setToast] = useState(null);
  const editorRef = useRef(null);

  const { darkMode, setDarkMode } = (() => {
    const [darkMode, setDarkMode] = useLocalStorage('ai-studio-dark', false);
    useEffect(() => {
      document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);
    return { darkMode, setDarkMode };
  })();

  const title = useMemo(() => {
    if (!content) return 'Untitled';
    const match = content.match(/^#\s+(.+)/m);
    return match ? match[1].trim() : content.split('\n')[0].trim().slice(0, 60) || 'Untitled';
  }, [content]);

  const wordCount = useMemo(() => {
    if (!content) return { words: 0, lines: 0, chars: 0 };
    const text = content.replace(/[#*_`~\[\]()]/g, '').trim();
    return {
      words: text ? text.split(/\s+/).length : 0,
      lines: content.split('\n').length,
      chars: content.length,
    };
  }, [content]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const saveDocument = useCallback(() => {
    setDocuments(prev => {
      const existing = prev.find(d => d.id === currentId);
      if (existing) {
        return prev.map(d => d.id === currentId ? { ...d, content, title, updatedAt: Date.now() } : d);
      }
      return prev;
    });
  }, [currentId, content, title, setDocuments]);

  const newDocument = useCallback(() => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const doc = { id, title: 'Untitled', content: '', createdAt: Date.now(), updatedAt: Date.now() };
    setDocuments(prev => [doc, ...prev]);
    setCurrentId(id);
    setContent('');
    showToast('New document created', 'success');
  }, [setDocuments, showToast]);

  const selectDocument = useCallback((id) => {
    const doc = documents.find(d => d.id === id);
    if (doc) {
      setCurrentId(id);
      setContent(doc.content || '');
    }
  }, [documents]);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      if (id === currentId && next.length > 0) {
        setCurrentId(next[0].id);
        setContent(next[0].content || '');
      } else if (id === currentId) {
        setCurrentId(null);
        setContent('');
      }
      return next;
    });
    showToast('Document deleted', 'info');
  }, [currentId, setDocuments, showToast]);

  const applyTemplate = useCallback((templateContent) => {
    setContent(templateContent);
    if (currentId) {
      setDocuments(prev => prev.map(d => d.id === currentId ? { ...d, content: templateContent, updatedAt: Date.now() } : d));
    }
    showToast('Template applied', 'success');
  }, [currentId, setDocuments, showToast]);

  const applyAIResult = useCallback((aiContent) => {
    setContent(aiContent);
    if (currentId) {
      setDocuments(prev => prev.map(d => d.id === currentId ? { ...d, content: aiContent, updatedAt: Date.now() } : d));
    }
  }, [currentId, setDocuments]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDocument();
        showToast('Document saved', 'success');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        newDocument();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveDocument, newDocument, showToast]);

  useEffect(() => {
    if (documents.length === 0) {
      newDocument();
    } else if (!currentId && documents.length > 0) {
      setCurrentId(documents[0].id);
      setContent(documents[0].content || '');
    }
  }, []);

  const tabs = [
    { id: 'editor', label: 'Editor' },
    { id: 'preview', label: 'Preview' },
  ];

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <style>{`
        @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideFromRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Top Bar */}
      <header className="h-14 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSidebar(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white hidden sm:block">AI Writing Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 dark:text-gray-500 mr-2 hidden sm:block">{title}</span>
          <button onClick={() => setShowTemplates(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title="Templates">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
          </button>
          <button onClick={() => setShowAI(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title="AI Assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </button>
          <button onClick={() => setShowExport(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title="Export">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'editor' ? (
          <Editor content={content} onChange={setContent} editorRef={editorRef} />
        ) : (
          <Preview content={content} />
        )}
      </div>

      {/* Word Count Bar */}
      <div className="h-7 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <div className="flex items-center gap-4 text-[11px] text-gray-400 dark:text-gray-500">
          <span>{wordCount.words} words</span>
          <span>{wordCount.lines} lines</span>
          <span>{wordCount.chars} chars</span>
        </div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500">
          {title}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="h-14 border-t border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-900 flex-shrink-0 z-30">
        <div className="flex w-full">
          {[
            { id: 'editor', label: 'Editor', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>) },
            { id: 'preview', label: 'Preview', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>) },
            { id: 'ai', label: 'AI', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>) },
            { id: 'export', label: 'Export', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>) },
            { id: 'settings', label: 'Settings', icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>) },
          ].map(tab => (
            <button key={tab.id} onClick={() => {
              if (tab.id === 'ai') setShowAI(true);
              else if (tab.id === 'export') setShowExport(true);
              else if (tab.id === 'settings') setShowSettings(true);
              else setActiveTab(tab.id);
            }}
              className={'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors ' + (activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300')}>
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modals & Panels */}
      {showSidebar && <Sidebar documents={documents} currentId={currentId} onSelect={selectDocument} onNew={newDocument} onDelete={deleteDocument} onClose={() => setShowSidebar(false)} />}
      {showTemplates && <TemplateModal onSelect={applyTemplate} onClose={() => setShowTemplates(false)} />}
      {showExport && <ExportModal content={content} title={title} onClose={() => setShowExport(false)} onToast={showToast} />}
      {showSettings && <SettingsPanel darkMode={darkMode} setDarkMode={setDarkMode} onClose={() => setShowSettings(false)} />}
      {showAI && <AIPanel content={content} onApply={applyAIResult} onClose={() => setShowAI(false)} onToast={showToast} />}

      {/* Toast */}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
