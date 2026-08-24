import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ai-writing-studio-docs';

const createDefaultDoc = () => ({
  id: Date.now().toString(),
  title: '无标题文档',
  content: '# 欢迎使用 AI Writing Studio\n\n这是一个 AI 驱动的 Markdown 写作助手。\n\n## 功能特点\n\n- **Markdown 编辑器** - 支持实时预览\n- **AI 写作模式** - 润色/扩写/缩写/翻译/总结/续写\n- **文档管理** - 本地存储，自动保存\n\n## 快速开始\n\n1. 在左侧编写 Markdown\n2. 右侧实时预览\n3. 选中文本，点击 AI 按钮进行处理\n\n---\n\n开始你的写作之旅吧！ ✍️',
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const docs = JSON.parse(saved);
        setDocuments(docs);
        if (docs.length > 0) {
          setCurrentDocId(docs[0].id);
        }
      } catch {
        const defaultDoc = createDefaultDoc();
        setDocuments([defaultDoc]);
        setCurrentDocId(defaultDoc.id);
      }
    } else {
      const defaultDoc = createDefaultDoc();
      setDocuments([defaultDoc]);
      setCurrentDocId(defaultDoc.id);
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
    return newDoc;
  }, []);

  const updateDocument = useCallback((id, updates) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === id 
        ? { ...doc, ...updates, updatedAt: Date.now() }
        : doc
    ));
  }, []);

  const deleteDocument = useCallback((id) => {
    setDocuments(prev => {
      const filtered = prev.filter(doc => doc.id !== id);
      if (filtered.length === 0) {
        const newDoc = createDefaultDoc();
        setCurrentDocId(newDoc.id);
        return [newDoc];
      }
      if (currentDocId === id) {
        setCurrentDocId(filtered[0].id);
      }
      return filtered;
    });
  }, [currentDocId]);

  const selectDocument = useCallback((id) => {
    setCurrentDocId(id);
  }, []);

  return {
    documents,
    currentDoc,
    currentDocId,
    createDocument,
    updateDocument,
    deleteDocument,
    selectDocument
  };
}
