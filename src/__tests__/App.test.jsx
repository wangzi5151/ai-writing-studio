import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

vi.mock('../components/Editor.jsx', () => ({
  default: function MockEditor({ value, onChange, onSelectionChange }) {
    return (
      <textarea
        aria-label="Markdown editor"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          onSelectionChange?.(event.target.value, 0, event.target.value.length);
        }}
      />
    );
  }
}));

describe('App document handling', () => {
  it('debounces auto-save and clears the dirty indicator', async () => {
    render(<App />);
    const editor = await screen.findByLabelText('Markdown editor');

    fireEvent.change(editor, { target: { value: '# Hello world' } });
    expect(screen.getByTestId('save-status')).toHaveTextContent('Unsaved');

    await waitFor(() => {
      const docs = JSON.parse(window.localStorage.getItem('ai-studio-docs'));
      expect(docs[0].content).toBe('# Hello world');
      expect(docs[0].title).toBe('Hello world');
    }, { timeout: 2500 });

    expect(screen.getByTestId('save-status')).toHaveTextContent('Saved');
  });

  it('flushes unsaved content before creating and switching documents', async () => {
    const user = userEvent.setup();
    render(<App />);
    const editor = await screen.findByLabelText('Markdown editor');

    fireEvent.change(editor, { target: { value: '# First doc' } });

    await user.click(screen.getByLabelText('Open documents'));
    await user.click(screen.getByRole('button', { name: /new document/i }));

    expect(screen.getByLabelText('Markdown editor')).toHaveValue('');

    await user.click(screen.getByLabelText('Open documents'));
    await user.click(screen.getByText('First doc'));

    expect(screen.getByLabelText('Markdown editor')).toHaveValue('# First doc');

    const docs = JSON.parse(window.localStorage.getItem('ai-studio-docs'));
    expect(docs.find(doc => doc.title === 'First doc')?.content).toBe('# First doc');
  });

  it('filters documents by title and content from the sidebar search', async () => {
    const user = userEvent.setup();
    window.localStorage.setItem('ai-studio-docs', JSON.stringify([
      { id: 'a', title: 'Alpha Notes', content: 'apple pie', createdAt: 1, updatedAt: 1 },
      { id: 'b', title: 'Beta Notes', content: 'banana bread', createdAt: 2, updatedAt: 2 }
    ]));

    render(<App />);
    await user.click(await screen.findByLabelText('Open documents'));
    await user.type(screen.getByPlaceholderText('Search documents...'), 'banana');

    expect(screen.getByText('Beta Notes')).toBeInTheDocument();
    expect(screen.queryByText('Alpha Notes')).not.toBeInTheDocument();
  });
});
