import React from 'react';

export default function Header({ document, onUpdateTitle }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(document?.title || '');

  React.useEffect(() => {
    setTitle(document?.title || '');
  }, [document?.title]);

  const handleSave = () => {
    if (title.trim() && document) {
      onUpdateTitle(document.id, title.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(document?.title || '');
      setIsEditing(false);
    }
  };

  return (
    <header className="h-12 border-b border-gray-700 flex items-center px-4 bg-gray-900/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="font-semibold text-gray-200">AI Writing Studio</span>
        </div>
      </div>
      
      <div className="flex-1 flex justify-center">
        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-sm text-gray-200 focus:outline-none focus:border-blue-500 max-w-xs"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors truncate max-w-xs"
            title="点击编辑标题"
          >
            {document?.title || '无标题'}
          </button>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="text-xs text-gray-500">
          {document ? new Date(document.updatedAt).toLocaleString('zh-CN') : ''}
        </div>
      </div>
    </header>
  );
}
