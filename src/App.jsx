const { useState, useEffect, useCallback, useRef, useMemo } = React;

const STORAGE_KEY = 'ai-writing-studio-docs';

const createDefaultDoc = () => ({
  id: Date.now().toString(),
  title: '无标题文档',
  content: '# 欢迎使用 AI Writing Studio\n\n这是一个 AI 驱动的 Markdown 写作助手。\n\n## 功能特点\n\n- **Markdown 编辑器** - 支持实时预览\n- **AI 写作模式** - 润色/扩写/缩写/翻译/总结/续写\n- **文档管理** - 本地存储，自动保存\n\n## 快速开始\n\n1. 在左侧编写 Markdown\n2. 右侧实时预览\n3. 选中文本，点击 AI 按钮进行处理\n\n---\n\n开始你的写作之旅吧！',
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

  const createDocument = useCallback(() => {
    const newDoc = createDefaultDoc();
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
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
      const response = await puter.ai.chat(`${prompt}\n\n原文：\n${text}`, { model: 'openai/gpt-5.5', stream: true });
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
    expand: (t) => callAI('请扩展以下文本，添加更多细节和内容，使其更丰富完整：', t),
    shorten: (t) => callAI('请精简以下文本，保留核心意思，去掉冗余内容：', t),
    translate: (t, lang) => callAI(`请将以下文本翻译为${lang}：`, t),
    summarize: (t) => callAI('请总结以下文本的要点，用简洁的语言概括：', t),
    continueWriting: (t) => callAI('请根据以下内容继续写下去，保持风格一致：', t)
  };
}

function Header({ document, onUpdateTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(document?.title || '');
  useEffect(() => setTitle(document?.title || ''), [document?.title]);
  const handleSave = () => { if (title.trim() && document) onUpdateTitle(document.id, title.trim()); setIsEditing(false); };
  return (
    <header className="h-12 border-b border-gray-700 flex items-center px-4 bg-gray-900/50">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-semibold text-gray-200">AI Writing Studio</span>
      </div>
      <div className="flex-1 flex justify-center">
        {isEditing ? (
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') { setTitle(document?.title || ''); setIsEditing(false); } }}
            autoFocus className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 max-w-xs" />
        ) : (
          <button onClick={() => setIsEditing(true)} className="text-sm text-gray-400 hover:text-gray-200 truncate max-w-xs">
            {document?.title || '无标题'}
          </button>
        )}
      </div>
      <div className="text-xs text-gray-500">{document ? new Date(document.updatedAt).toLocaleString('zh-CN') : ''}</div>
    </header>
  );
}

function Sidebar({ documents, currentDocId, onSelect, onCreate, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = documents.filter(d => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()));
  const formatDate = (ts) => { const d = Date.now() - ts; if (d < 60000) return '刚刚'; if (d < 3600000) return `${Math.floor(d/60000)}分钟前`; if (d < 86400000) return `${Math.floor(d/3600000)}小时前`; return new Date(ts).toLocaleDateString('zh-CN'); };
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">文档列表</h2>
          <button onClick={onCreate} className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg" title="新建文档">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </button>
        </div>
        <input type="text" placeholder="搜索文档..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500" />
      </div>
      <div className="flex-1 overflow-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">{search ? '没有找到匹配的文档' : '暂无文档'}</div>
        ) : (
          <div className="space-y-1">
            {filtered.map(doc => (
              <div key={doc.id} onClick={() => onSelect(doc.id)}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${doc.id === currentDocId ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-gray-800/50'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">{doc.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{formatDate(doc.updatedAt)}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('确定删除此文档？')) onDelete(doc.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded">
                    <svg className="w-4 h-4 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 border-t border-gray-700"><div className="text-xs text-gray-500 text-center">{documents.length} 个文档</div></div>
    </div>
  );
}

function Editor({ value, onChange, onTextSelect }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'default',
        matchBrackets: true,
        autoCloseBrackets: true,
        extraKeys: {
          'Enter': 'newlineAndIndentContinueMarkdownList'
        }
      });
      editorRef.current.on('change', () => {
        const val = editorRef.current.getValue();
        onChange(val);
      });
      editorRef.current.on('cursorActivity', () => {
        const sel = editorRef.current.getSelection();
        if (sel) onTextSelect(sel);
      });
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const currentVal = editorRef.current.getValue();
      if (currentVal !== value) {
        editorRef.current.setValue(value || '');
      }
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

function AIPanel({ selectedText, onApplyResult }) {
  const { loading, error, result, setResult, polish, expand, shorten, translate, summarize, continueWriting } = useAI();
  const [translateLang, setTranslateLang] = useState('英文');
  const [activeMode, setActiveMode] = useState(null);

  const handleAIAction = async (mode) => {
    if (!selectedText.trim()) return;
    setActiveMode(mode);
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
    finally { setActiveMode(null); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700"><h3 className="text-sm font-semibold text-gray-300">AI 助手</h3></div>
      <div className="flex-1 overflow-auto p-3">
        {selectedText && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">选中的文本</div>
            <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg max-h-32 overflow-auto">{selectedText}</div>
          </div>
        )}
        <div className="space-y-2">
          {AI_MODES.map(mode => (
            <button key={mode.id} onClick={() => handleAIAction(mode.id)} disabled={loading || !selectedText.trim()}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeMode === mode.id ? 'bg-blue-600/30 border border-blue-500/50' : 'bg-gray-800/50 hover:bg-gray-700/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>
              <span className="text-lg">{mode.icon}</span>
              <div><div className="text-sm font-medium text-gray-200">{mode.name}</div><div className="text-xs text-gray-500">{mode.desc}</div></div>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-gray-500 mb-1 block">翻译目标语言</label>
          <select value={translateLang} onChange={(e) => setTranslateLang(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
        {loading && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
              <span className="text-sm">AI 正在处理...</span>
            </div>
            {result && <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-auto">{result}</div>}
          </div>
        )}
        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{error}</div>}
        {result && !loading && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-gray-800/50 rounded-lg"><div className="text-xs text-gray-500 mb-2">AI 结果</div><div className="text-sm text-gray-300 whitespace-pre-wrap">{result}</div></div>
            <div className="flex gap-2">
              <button onClick={() => onApplyResult(result)} className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg">应用到编辑器</button>
              <button onClick={() => setResult('')} className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg">清除</button>
            </div>
          </div>
        )}
        {!selectedText && !loading && <div className="text-center text-gray-500 text-sm py-8">在编辑器中选中文本后，点击上方按钮进行 AI 处理</div>}
      </div>
    </div>
  );
}

function App() {
  const { documents, currentDoc, currentDocId, createDocument, updateDocument, deleteDocument, selectDocument } = useDocuments();
  const [selectedText, setSelectedText] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAIPanel, setShowAIPanel] = useState(true);

  const handleContentChange = useCallback((content) => {
    if (currentDoc) {
      const titleMatch = content.match(/^#\s+(.+)/m);
      const newTitle = titleMatch ? titleMatch[1].trim() : '无标题文档';
      updateDocument(currentDoc.id, { content, title: newTitle });
    }
  }, [currentDoc, updateDocument]);

  const handleApplyResult = useCallback((result) => {
    if (currentDoc) updateDocument(currentDoc.id, { content: currentDoc.content + '\n\n' + result });
  }, [currentDoc, updateDocument]);

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Header document={currentDoc} onUpdateTitle={(id, title) => updateDocument(id, { title })} />
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <div className="w-64 border-r border-gray-700 flex-shrink-0">
            <Sidebar documents={documents} currentDocId={currentDocId} onSelect={selectDocument} onCreate={createDocument} onDelete={deleteDocument} />
          </div>
        )}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-gray-700">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800/30">
              <button onClick={() => setShowSidebar(!showSidebar)} className="p-1.5 hover:bg-gray-700 rounded" title="切换侧边栏">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <span className="text-xs text-gray-500">编辑器</span>
            </div>
            <div className="flex-1 overflow-hidden"><Editor value={currentDoc?.content || ''} onChange={handleContentChange} onTextSelect={setSelectedText} /></div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/30"><span className="text-xs text-gray-500">预览</span></div>
            <div className="flex-1 overflow-hidden"><Preview content={currentDoc?.content || ''} /></div>
          </div>
        </div>
        {showAIPanel && (
          <div className="w-72 border-l border-gray-700 flex-shrink-0">
            <AIPanel selectedText={selectedText} onApplyResult={handleApplyResult} />
          </div>
        )}
        <button onClick={() => setShowAIPanel(!showAIPanel)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-l-lg z-10"
          style={{ right: showAIPanel ? '288px' : '0' }}>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </button>
      </div>
      <footer className="h-6 border-t border-gray-700 flex items-center px-4 bg-gray-900/50">
        <div className="flex-1 flex items-center gap-4 text-xs text-gray-500">
          <span>AI Writing Studio</span>
          <span>|</span>
          <span>{currentDoc ? `${currentDoc.content.length} 字符` : ''}</span>
        </div>
        <div className="text-xs text-gray-500">Powered by Puter.js</div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
