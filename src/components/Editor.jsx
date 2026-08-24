import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { EditorView } from '@codemirror/view';

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1a1b26',
    color: '#c0caf5'
  },
  '.cm-content': {
    caretColor: '#c0caf5',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace"
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#c0caf5'
  },
  '.cm-activeLine': {
    backgroundColor: '#24283b'
  },
  '.cm-selectionBackground': {
    backgroundColor: '#33467c !important'
  },
  '.cm-gutters': {
    backgroundColor: '#1a1b26',
    color: '#3b4261',
    borderRight: '1px solid #3b4261'
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#24283b'
  }
}, { dark: true });

export default function Editor({ value, onChange }) {
  const handleChange = React.useCallback((val) => {
    onChange(val);
  }, [onChange]);

  return (
    <div className="h-full">
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
          EditorView.lineWrapping
        ]}
        theme={darkTheme}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          indentOnInput: true
        }}
        className="h-full"
      />
    </div>
  );
}
