import { useState, useCallback } from 'react';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');

  const callAI = useCallback(async (prompt, text) => {
    setLoading(true);
    setError(null);
    setResult('');

    try {
      const fullPrompt = `${prompt}\n\n原文：\n${text}`;
      
      const response = await puter.ai.chat(fullPrompt, {
        model: 'openai/gpt-5.5',
        stream: true
      });

      let fullResult = '';
      for await (const part of response) {
        if (part?.text) {
          fullResult += part.text;
          setResult(fullResult);
        }
      }
      
      setLoading(false);
      return fullResult;
    } catch (err) {
      setError(err.message || 'AI 调用失败');
      setLoading(false);
      throw err;
    }
  }, []);

  const polish = useCallback((text) => {
    return callAI('请润色以下文本，使其更流畅、专业，保持原意不变：', text);
  }, [callAI]);

  const expand = useCallback((text) => {
    return callAI('请扩展以下文本，添加更多细节和内容，使其更丰富完整：', text);
  }, [callAI]);

  const shorten = useCallback((text) => {
    return callAI('请精简以下文本，保留核心意思，去掉冗余内容：', text);
  }, [callAI]);

  const translate = useCallback((text, targetLang = '英文') => {
    return callAI(`请将以下文本翻译为${targetLang}：`, text);
  }, [callAI]);

  const summarize = useCallback((text) => {
    return callAI('请总结以下文本的要点，用简洁的语言概括：', text);
  }, [callAI]);

  const continueWriting = useCallback((text) => {
    return callAI('请根据以下内容继续写下去，保持风格一致：', text);
  }, [callAI]);

  return {
    loading,
    error,
    result,
    setResult,
    polish,
    expand,
    shorten,
    translate,
    summarize,
    continueWriting
  };
}
