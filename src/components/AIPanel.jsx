import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';

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

export default function AIPanel({ selectedText, onApplyResult }) {
  const { loading, error, result, setResult, polish, expand, shorten, translate, summarize, continueWriting } = useAI();
  const [translateLang, setTranslateLang] = useState('英文');
  const [activeMode, setActiveMode] = useState(null);

  const handleAIAction = async (mode) => {
    if (!selectedText.trim()) return;
    setActiveMode(mode);
    
    try {
      let res;
      switch (mode) {
        case 'polish':
          res = await polish(selectedText);
          break;
        case 'expand':
          res = await expand(selectedText);
          break;
        case 'shorten':
          res = await shorten(selectedText);
          break;
        case 'translate':
          res = await translate(selectedText, translateLang);
          break;
        case 'summarize':
          res = await summarize(selectedText);
          break;
        case 'continue':
          res = await continueWriting(selectedText);
          break;
      }
    } catch (err) {
      console.error('AI Error:', err);
    } finally {
      setActiveMode(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">AI 助手</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-3">
        {selectedText && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">选中的文本</div>
            <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg max-h-32 overflow-auto">
              {selectedText}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {AI_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleAIAction(mode.id)}
              disabled={loading || !selectedText.trim()}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                activeMode === mode.id 
                  ? 'bg-blue-600/30 border border-blue-500/50' 
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span className="text-lg">{mode.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-200">{mode.name}</div>
                <div className="text-xs text-gray-500">{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs text-gray-500 mb-1 block">翻译目标语言</label>
          <select
            value={translateLang}
            onChange={(e) => setTranslateLang(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">AI 正在处理...</span>
            </div>
            {result && (
              <div className="mt-3 text-sm text-gray-300 whitespace-pre-wrap max-h-48 overflow-auto">
                {result}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="mt-4 space-y-2">
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <div className="text-xs text-gray-500 mb-2">AI 结果</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{result}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onApplyResult(result)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                应用到编辑器
              </button>
              <button
                onClick={() => setResult('')}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
          </div>
        )}

        {!selectedText && !loading && (
          <div className="text-center text-gray-500 text-sm py-8">
            在编辑器中选中文本后，点击上方按钮进行 AI 处理
          </div>
        )}
      </div>
    </div>
  );
}
