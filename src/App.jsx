import React, { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from 'react';

const STORAGE_KEY = 'ai-writing-studio-docs';
const THEME_KEY = 'ai-writing-theme';
const TIPS_KEY = 'ai-writing-tip-index';

const createDefaultDoc = () => ({
  id: Date.now().toString(),
  title: '无标题文档',
  content: '# 欢迎使用 AI Writing Studio\n\n这是一个 AI 驱动的 Markdown 写作助手。\n\n## 功能特点\n\n- **Markdown 编辑器** - 支持实时预览\n- **AI 写作模式** - 润色/扩写/缩写/翻译/总结/续写\n- **文档管理** - 本地存储，自动保存\n- **模板系统** - 多种写作模板\n- **导出功能** - 支持多种格式导出\n\n## 快速开始\n\n1. 点击左上角菜单选择模板\n2. 在编辑器中编写内容\n3. 右侧实时预览\n4. 选中文本，点击 AI 按钮进行处理\n\n---\n\n开始你的写作之旅吧！ ✍️',
  createdAt: Date.now(),
  updatedAt: Date.now()
});

const AI_MODES = [
  { id: 'polish', name: '润色', icon: '✨', desc: '优化文本流畅度' },
  { id: 'expand', name: '扩写', icon: '📝', desc: '添加更多细节' },
  { id: 'shorten', name: '缩写', icon: '✂️', desc: '精简保留核心' },
  { id: 'translate', name: '翻译', icon: '🌐', desc: '翻译为其他语言' },
  { id: 'summarize', name: '总结', icon: '📋', desc: '提取关键要点' },
  { id: 'continue', name: '续写', icon: '➡️', desc: '继续创作内容' }
];

const LANGUAGES = [
  { value: '英文', label: 'English' },
  { value: '中文', label: '中文' },
  { value: '日文', label: '日本語' },
  { value: '韩文', label: '한국어' },
  { value: '法文', label: 'Français' },
  { value: '德文', label: 'Deutsch' },
  { value: '西班牙文', label: 'Español' }
];

const TEMPLATES = [
  { id: 'blog', name: '博客文章', icon: '📝', content: '# 文章标题\n\n## 引言\n\n在这里写引言...\n\n## 正文\n\n### 第一部分\n\n内容...\n\n## 总结\n\n总结全文要点...' },
  { id: 'email', name: '商务邮件', icon: '📧', content: '**主题：** \n\n尊敬的 [收件人]：\n\n您好！\n\n[正文内容]\n\n此致\n敬礼\n\n[您的姓名]' },
  { id: 'resume', name: '简历', icon: '👤', content: '# 个人简历\n\n## 基本信息\n\n- **姓名：** \n- **电话：** \n- **邮箱：** \n\n## 教育背景\n\n## 工作经历\n\n## 专业技能\n\n## 项目经验' },
  { id: 'essay', name: '论文大纲', icon: '📚', content: '# 论文标题\n\n## 摘要\n\n## 关键词\n\n## 1. 引言\n\n## 2. 文献综述\n\n## 3. 研究方法\n\n## 4. 结果与讨论\n\n## 5. 结论\n\n## 参考文献' },
  { id: 'meeting', name: '会议纪要', icon: '📋', content: '# 会议纪要\n\n**日期：** \n**地点：** \n**参会人员：** \n\n## 议题1\n\n## 议题2\n\n## 待办事项\n\n- [ ] ' },
  { id: 'todo', name: '待办清单', icon: '✅', content: '# 今日待办\n\n## 重要紧急\n\n- [ ] \n\n## 重要不紧急\n\n- [ ] ' },
  { id: 'blank', name: '空白文档', icon: '📄', content: '' }
];

const WRITING_TIPS = [
  '好的写作始于清晰的思路。在动笔前，先想清楚你要表达什么。',
  '使用主动语态让文章更有力量。',
  '每段话只表达一个核心观点。',
  '用具体的例子支撑抽象的观点。',
  '写完后大声读出来，检查语句是否通顺。',
  '删除多余的词语。',
  '变换句子长度，让文章有节奏感。',
  '用数据说话，但不要堆砌数字。',
  '开头要吸引人，结尾要有力。',
  '写作是修改的过程，好文章是改出来的。'
];

// Hooks
function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const docs = JSON.parse(saved);
        setDocuments(docs);
        if (docs.length > 0) setCurrentDocId(docs[0].id);
      } catch {
        const doc = createDefaultDoc();
        setDocuments([doc]);
        setCurrentDocId(doc.id);
      }
    } else {
      const doc = createDefaultDoc();
      setDocuments([doc]);
      setCurrentDocId(doc.id);
    }
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }
  }, [documents]);

  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];

  const createDocument = useCallback((template) => {
    const newDoc = {
      ...createDefaultDoc(),
      content: template || createDefaultDoc().content
    };
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    return newDoc;
  }, []);

  const updateDocument = useCallback((id, updates) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id ? { ...doc, ...updates, updatedAt: Date.now() } : doc
    ));
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.id !== id);
      if (filtered.length === 0) {
        const doc = createDefaultDoc();
        setCurrentDocId(doc.id);
        return [doc];
      }
      if (currentDocId === id) setCurrentDocId(filtered[0].id);
      return filtered;
    });
  }, [currentDocId]);

  return { documents, currentDoc, currentDocId, createDocument, updateDocument, deleteDocument, selectDocument: setCurrentDocId };
}

function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');

  const callAI = useCallback(async (prompt, text) => {
    setLoading(true);
    setError(null);
    setResult('');
    try {
      const response = await window.puter.ai.chat(`${prompt}\n\n原文：\n${text}`, { model: 'openai/gpt-5.5', stream: true });
      let full = '';
      for await (const part of response) {
        if (part?.text) { full += part.text; setResult(full); }
      }
      setLoading(false);
      return full;
    } catch (err) {
      setError(err.message || 'AI 调用失败');
      setLoading(false);
      throw err;
    }
  }, []);

  return {
    loading, error, result, setResult,
    polish: (t) => callAI('请润色以下文本，使其更流畅、专业，保持原意不变：', t),
    expand: (t) => callAI('请扩展以下文本，添加更多细节和内容：', t),
    shorten: (t) => callAI('请精简以下文本，保留核心意思：', t),
    translate: (t, lang) => callAI(`请将以下文本翻译为${lang}：`, t),
    summarize: (t) => callAI('请总结以下文本的要点：', t),
    continueWriting: (t) => callAI('请根据以下内容继续写下去：', t)
  };
}

// Components
function Header({ document, onUpdateTitle, onMenuClick, onSettingsClick }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document?.title || '');
  useEffect(() => setTitle(document?.title || ''), [document?.title]);
  
  const handleSave = () => {
    if (title.trim() && document) onUpdateTitle(document.id, title.trim());
    setIsEditing(false);
  };

  return (
    <header className="h-12 border-b flex items-center px-4" style={{ borderColor: 'var(--md-outline-variant)', background: 'var(--md-surface)' }}>
      <button onClick={onMenuClick} className="p-2 rounded-full mr-2 hover:bg-opacity-10" style={{ color: 'var(--md-on-surface)' }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex-1 flex justify-center">
        {isEditing ? (
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setTitle(document?.title || ''); setIsEditing(false); } }}
            autoFocus className="md-input text-center max-w-xs" />
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-sm font-medium truncate max-w-xs" style={{ color: 'var(--md-on-surface)' }}>
            {document?.title || '无标题'}
          </button>
        )}
      </div>
      
      <button onClick={onSettingsClick} className="p-2 rounded-full ml-2" style={{ color: 'var(--md-on-surface)' }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  );
}

function Sidebar({ documents, currentDocId, onSelect, onCreate, onDelete, isOpen, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative w-72 h-full slide-up" style={{ background: 'var(--md-surface)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--md-outline-variant)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--md-on-surface)' }}>文档列表</h2>
            <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--md-on-surface)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input type="text" placeholder="搜索文档..." value={search} onChange={(e) => setSearch(e.target.value)} className="md-input" />
        </div>
        
        <div className="overflow-auto" style={{ height: 'calc(100% - 180px)' }}>
          {filtered.map(doc => (
            <div key={doc.id} onClick={() => { onSelect(doc.id); onClose(); }}
              className="p-4 cursor-pointer border-b" style={{ borderColor: 'var(--md-outline-variant)', background: doc.id === currentDocId ? 'var(--md-primary-container)' : 'transparent' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: doc.id === currentDocId ? 'var(--md-on-primary-container)' : 'var(--md-on-surface)' }}>
                    {doc.title}
                  </div>
                  <div className="text-sm mt-1" style={{ color: 'var(--md-outline)' }}>
                    {new Date(doc.updatedAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); if (confirm('确定删除？')) onDelete(doc.id); }}
                  className="p-2 rounded-full opacity-50 hover:opacity-100" style={{ color: 'var(--md-error)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--md-outline-variant)', background: 'var(--md-surface)' }}>
          <button onClick={() => { onCreate(); onClose(); }} className="w-full py-3 rounded-xl font-medium ripple" style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}>
            + 新建文档
          </button>
        </div>
      </div>
    </div>
  );
}

function TemplateModal({ isOpen, onClose, onSelect }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-md rounded-2xl p-6 fade-in" style={{ background: 'var(--md-surface)', boxShadow: 'var(--md-elevation-3)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--md-on-surface)' }}>选择模板</h3>
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { onSelect(t.content); onClose(); }}
              className="p-4 rounded-xl text-left hover:bg-opacity-50 transition-all" style={{ background: 'var(--md-surface-2)' }}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-medium" style={{ color: 'var(--md-on-surface)' }}>{t.name}</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full" style={{ color: 'var(--md-on-surface)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ExportModal({ isOpen, onClose, content, title }) {
  if (!isOpen) return null;
  
  const handleExport = async (type) => {
    const { marked } = await import('marked');
    marked.setOptions({ breaks: true, gfm: true });
    
    if (type === 'markdown') {
      const blob = new Blob([content], { type: 'text/markdown' });
      downloadBlob(blob, `${title}.md`);
    } else if (type === 'html') {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px;line-height:1.8;}pre{background:#f5f5f5;padding:15px;border-radius:8px;overflow-x:auto;}code{background:#f0f0f0;padding:2px 6px;border-radius:4px;}</style></head><body>${marked.parse(content)}</body></html>`;
      const blob = new Blob([html], { type: 'text/html' });
      downloadBlob(blob, `${title}.html`);
    } else if (type === 'text') {
      const text = content.replace(/[#*_`~]/g, '');
      const blob = new Blob([text], { type: 'text/plain' });
      downloadBlob(blob, `${title}.txt`);
    }
    onClose();
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative w-full max-w-sm rounded-2xl p-6 fade-in" style={{ background: 'var(--md-surface)', boxShadow: 'var(--md-elevation-3)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--md-on-surface)' }}>导出文档</h3>
        <div className="space-y-3">
          <button onClick={() => handleExport('markdown')} className="w-full p-4 rounded-xl text-left flex items-center gap-3" style={{ background: 'var(--md-surface-2)' }}>
            <span className="text-xl">📄</span>
            <div>
              <div className="font-medium" style={{ color: 'var(--md-on-surface)' }}>Markdown</div>
              <div className="text-sm" style={{ color: 'var(--md-outline)' }}>.md 格式</div>
            </div>
          </button>
          <button onClick={() => handleExport('html')} className="w-full p-4 rounded-xl text-left flex items-center gap-3" style={{ background: 'var(--md-surface-2)' }}>
            <span className="text-xl">🌐</span>
            <div>
              <div className="font-medium" style={{ color: 'var(--md-on-surface)' }}>HTML</div>
              <div className="text-sm" style={{ color: 'var(--md-outline)' }}>.html 格式</div>
            </div>
          </button>
          <button onClick={() => handleExport('text')} className="w-full p-4 rounded-xl text-left flex items-center gap-3" style={{ background: 'var(--md-surface-2)' }}>
            <span className="text-xl">📝</span>
            <div>
              <div className="font-medium" style={{ color: 'var(--md-on-surface)' }}>纯文本</div>
              <div className="text-sm" style={{ color: 'var(--md-outline)' }}>.txt 格式</div>
            </div>
          </button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full" style={{ color: 'var(--md-on-surface)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ isOpen, onClose, theme, onThemeChange }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative ml-auto w-80 h-full slide-up" style={{ background: 'var(--md-surface)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--md-outline-variant)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--md-on-surface)' }}>设置</h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--md-on-surface)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--md-on-surface)' }}>主题</label>
            <div className="flex gap-2">
              <button onClick={() => onThemeChange('light')} className="flex-1 py-3 rounded-xl" style={{ background: theme === 'light' ? 'var(--md-primary-container)' : 'var(--md-surface-2)', color: 'var(--md-on-surface)' }}>
                ☀️ 浅色
              </button>
              <button onClick={() => onThemeChange('dark')} className="flex-1 py-3 rounded-xl" style={{ background: theme === 'dark' ? 'var(--md-primary-container)' : 'var(--md-surface-2)', color: 'var(--md-on-surface)' }}>
                🌙 深色
              </button>
            </div>
          </div>
          <div className="pt-4 border-t" style={{ borderColor: 'var(--md-outline-variant)' }}>
            <div className="text-sm" style={{ color: 'var(--md-outline)' }}>AI Writing Studio v1.0.0</div>
            <div className="text-sm mt-1" style={{ color: 'var(--md-outline)' }}>Powered by Puter.js</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Editor({ value, onChange, onTextSelect }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && !editorRef.current && window.CodeMirror) {
      editorRef.current = window.CodeMirror.fromTextArea(textareaRef.current, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'default',
        matchBrackets: true,
        autoCloseBrackets: true
      });
      editorRef.current.on('change', () => onChange(editorRef.current.getValue()));
      editorRef.current.on('cursorActivity', () => {
        const sel = editorRef.current.getSelection();
        if (sel) onTextSelect(sel);
      });
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value || '');
    }
  }, [value]);

  return <div className="h-full"><textarea ref={textareaRef} /></div>;
}

function Preview({ content }) {
  const html = useMemo(() => {
    try { return marked.parse(content || ''); } 
    catch { return '<p>渲染错误</p>'; }
  }, [content]);
  return <div className="h-full overflow-auto p-6"><div className="markdown-preview" dangerouslySetInnerHTML={{ __html: html }} /></div>;
}

function AIPanel({ selectedText, onApplyResult, isOpen, onClose }) {
  const { loading, error, result, setResult, polish, expand, shorten, translate, summarize, continueWriting } = useAI();
  const [translateLang, setTranslateLang] = useState('英文');

  const handleAIAction = async (mode) => {
    if (!selectedText.trim()) return;
    try {
      switch (mode) {
        case 'polish': await polish(selectedText); break;
        case 'expand': await expand(selectedText); break;
        case 'shorten': await shorten(selectedText); break;
        case 'translate': await translate(selectedText, translateLang); break;
        case 'summarize': await summarize(selectedText); break;
        case 'continue': await continueWriting(selectedText); break;
      }
    } catch (err) { console.error(err); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative ml-auto w-80 h-full slide-up" style={{ background: 'var(--md-surface)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--md-outline-variant)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--md-on-surface)' }}>AI 助手</h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--md-on-surface)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-auto" style={{ height: 'calc(100% - 64px)' }}>
          <div className="p-4">
            {selectedText && (
              <div className="mb-4 p-3 rounded-xl" style={{ background: 'var(--md-surface-2)' }}>
                <div className="text-xs mb-2" style={{ color: 'var(--md-outline)' }}>选中的文本</div>
                <div className="text-sm max-h-24 overflow-auto" style={{ color: 'var(--md-on-surface)' }}>{selectedText}</div>
              </div>
            )}
            
            <div className="space-y-2">
              {AI_MODES.map(mode => (
                <button key={mode.id} onClick={() => handleAIAction(mode.id)} disabled={loading || !selectedText.trim()}
                  className="w-full p-3 rounded-xl text-left flex items-center gap-3 ripple disabled:opacity-50" style={{ background: 'var(--md-surface-2)' }}>
                  <span className="text-xl">{mode.icon}</span>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--md-on-surface)' }}>{mode.name}</div>
                    <div className="text-sm" style={{ color: 'var(--md-outline)' }}>{mode.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm mb-2" style={{ color: 'var(--md-outline)' }}>翻译语言</label>
              <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)} className="md-input">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            
            {loading && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--md-primary-container)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--md-on-primary-container)' }}>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>AI 正在处理...</span>
                </div>
                {result && <div className="mt-3 text-sm whitespace-pre-wrap max-h-48 overflow-auto" style={{ color: 'var(--md-on-primary-container)' }}>{result}</div>}
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--md-error)', color: 'var(--md-on-error)' }}>{error}</div>
            )}
            
            {result && !loading && (
              <div className="mt-4 space-y-3">
                <div className="p-4 rounded-xl" style={{ background: 'var(--md-surface-2)' }}>
                  <div className="text-xs mb-2" style={{ color: 'var(--md-outline)' }}>AI 结果</div>
                  <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--md-on-surface)' }}>{result}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onApplyResult(result)} className="flex-1 py-3 rounded-xl font-medium ripple" style={{ background: 'var(--md-primary)', color: 'var(--md-on-primary)' }}>
                    应用到编辑器
                  </button>
                  <button onClick={() => setResult('')} className="px-4 py-3 rounded-xl" style={{ background: 'var(--md-surface-2)', color: 'var(--md-on-surface)' }}>
                    清除
                  </button>
                </div>
              </div>
            )}
            
            {!selectedText && !loading && (
              <div className="text-center py-8" style={{ color: 'var(--md-outline)' }}>
                选中文本后点击 AI 按钮
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'editor', icon: '✏️', label: '编辑' },
    { id: 'ai', icon: '🤖', label: 'AI' },
    { id: 'export', icon: '📤', label: '导出' },
    { id: 'settings', icon: '⚙️', label: '设置' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}>
            <div className="icon-container">
              <span className="text-xl">{tab.icon}</span>
            </div>
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function TipBanner() {
  const [tipIndex, setTipIndex] = useState(() => {
    const saved = localStorage.getItem(TIPS_KEY);
    return saved ? parseInt(saved) : 0;
  });
  const [visible, setVisible] = useState(true);

  const handleNext = () => {
    const next = (tipIndex + 1) % WRITING_TIPS.length;
    setTipIndex(next);
    localStorage.setItem(TIPS_KEY, next.toString());
  };

  if (!visible) return null;

  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'var(--md-primary-container)' }}>
      <span className="text-lg">💡</span>
      <div className="flex-1 text-sm" style={{ color: 'var(--md-on-primary-container)' }}>{WRITING_TIPS[tipIndex]}</div>
      <button onClick={handleNext} className="p-1" style={{ color: 'var(--md-on-primary-container)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button onClick={() => setVisible(false)} className="p-1" style={{ color: 'var(--md-on-primary-container)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function App() {
  const { documents, currentDoc, currentDocId, createDocument, updateDocument, deleteDocument, selectDocument } = useDocuments();
  const [selectedText, setSelectedText] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'light');
  const [saveStatus, setSaveStatus] = useState('已保存');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const handleContentChange = useCallback((content) => {
    if (currentDoc) {
      const titleMatch = content.match(/^#\s+(.+)/m);
      const newTitle = titleMatch ? titleMatch[1].trim() : '无标题文档';
      updateDocument(currentDoc.id, { content, title: newTitle });
      setSaveStatus('保存中...');
      setTimeout(() => setSaveStatus('已保存'), 500);
    }
  }, [currentDoc, updateDocument]);

  const handleApplyResult = useCallback((result) => {
    if (currentDoc) updateDocument(currentDoc.id, { content: currentDoc.content + '\n\n' + result });
  }, [currentDoc, updateDocument]);

  const handleTabChange = (tab) => {
    if (tab === 'ai') setShowAIPanel(true);
    else if (tab === 'export') setShowExportModal(true);
    else if (tab === 'settings') setShowSettings(true);
    else setActiveTab(tab);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--md-surface)' }}>
      <Header 
        document={currentDoc} 
        onUpdateTitle={(id, title) => updateDocument(id, { title })}
        onMenuClick={() => setShowSidebar(true)}
        onSettingsClick={() => setShowSettings(true)}
      />
      
      <TipBanner />
      
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: '64px' }}>
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: 'var(--md-outline-variant)', background: 'var(--md-surface-2)' }}>
            <span className="text-sm" style={{ color: 'var(--md-outline)' }}>编辑器</span>
            <span className="text-sm" style={{ color: 'var(--md-outline)' }}>|</span>
            <span className="text-sm" style={{ color: 'var(--md-outline)' }}>{saveStatus}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <Editor value={currentDoc?.content || ''} onChange={handleContentChange} onTextSelect={setSelectedText} />
          </div>
        </div>
      </div>
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      
      <Sidebar documents={documents} currentDocId={currentDocId} onSelect={selectDocument} onCreate={(content) => createDocument(content)} onDelete={deleteDocument} isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
      <TemplateModal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} onSelect={(content) => createDocument(content)} />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} content={currentDoc?.content || ''} title={currentDoc?.title || 'document'} />
      <AIPanel selectedText={selectedText} onApplyResult={handleApplyResult} isOpen={showAIPanel} onClose={() => setShowAIPanel(false)} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} theme={theme} onThemeChange={setTheme} />
    </div>
  );
}

export default App;
