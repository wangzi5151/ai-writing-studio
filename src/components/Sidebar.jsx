import React, { useState } from 'react';

export default function Sidebar({ 
  documents, 
  currentDocId, 
  onSelect, 
  onCreate, 
  onDelete 
}) {
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) ||
    doc.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">文档列表</h2>
          <button
            onClick={onCreate}
            className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="新建文档"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          placeholder="搜索文档..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {filteredDocs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            {search ? '没有找到匹配的文档' : '暂无文档'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                  doc.id === currentDocId
                    ? 'bg-blue-600/20 border border-blue-500/30'
                    : 'hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-200 truncate">
                      {doc.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(doc.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('确定删除此文档？')) {
                        onDelete(doc.id);
                      }
                    }}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded transition-all"
                  >
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
      
      <div className="p-3 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          {documents.length} 个文档
        </div>
      </div>
    </div>
  );
}
