import { useState, useCallback, useRef } from 'react';
import { loadPuter } from '../utils/puter';

const AI_PROMPTS = {
  polish: 'Polish this text for grammar, clarity, and flow. Fix errors and improve readability while maintaining the original meaning:',
  expand: 'Expand this text with more details, examples, and explanations. Make it more comprehensive:',
  shorten: 'Shorten this text while keeping the key information. Make it more concise:',
  translate: 'Translate this text to English. If already in English, translate to Spanish:',
  summarize: 'Create a concise summary of this text highlighting the main points:',
  continue: 'Continue writing from this text. Maintain the same style and tone:',
  formal: 'Rewrite this text in a more formal, professional tone:',
  creative: 'Rewrite this text with more creative and engaging language:'
};

const TIMEOUT_MS = 60000;

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState('');
  const controllerRef = useRef(null);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const callAI = useCallback(async (prompt, text) => {
    if (!text || !text.trim()) return null;

    const controller = new AbortController();
    controllerRef.current = controller;
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, TIMEOUT_MS);

    setLoading(true);
    setError(null);
    setResult('');

    try {
      const puter = await loadPuter();
      if (controller.signal.aborted) {
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        throw abortError;
      }

      const response = await puter.ai.chat(
        `${prompt}\n\n${text}`,
        { stream: true, signal: controller.signal }
      );

      let fullResult = '';
      if (typeof response === 'string') {
        fullResult = response;
      } else if (response && typeof response[Symbol.asyncIterator] === 'function') {
        for await (const part of response) {
          if (controller.signal.aborted) break;
          if (part?.text) {
            fullResult += part.text;
            setResult(fullResult);
          }
        }
      } else if (response?.message?.content) {
        fullResult = response.message.content;
      }

      setResult(fullResult);
      setLoading(false);
      return fullResult;
    } catch (err) {
      const aborted = err?.name === 'AbortError' || controller.signal.aborted;
      setError(
        aborted
          ? timedOut
            ? 'AI 请求超时，请重试'
            : '已取消 AI 请求'
          : err?.message || 'AI 调用失败'
      );
      setLoading(false);
      return null;
    } finally {
      clearTimeout(timeoutId);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const processText = useCallback((text, mode, customPrompt) => {
    const prompt = customPrompt || AI_PROMPTS[mode] || AI_PROMPTS.polish;
    return callAI(prompt, text);
  }, [callAI]);

  const polish = useCallback((text) => callAI('请润色以下文本，使其更流畅、专业，保持原意不变：', text), [callAI]);
  const expand = useCallback((text) => callAI('请扩展以下文本，添加更多细节和内容，使其更丰富完整：', text), [callAI]);
  const shorten = useCallback((text) => callAI('请精简以下文本，保留核心意思，去掉冗余内容：', text), [callAI]);
  const translate = useCallback((text, targetLang = '英文') => callAI(`请将以下文本翻译为${targetLang}：`, text), [callAI]);
  const summarize = useCallback((text) => callAI('请总结以下文本的要点，用简洁的语言概括：', text), [callAI]);
  const continueWriting = useCallback((text) => callAI('请根据以下内容继续写下去，保持风格一致：', text), [callAI]);

  return {
    loading,
    isProcessing: loading,
    error,
    result,
    setResult,
    processText,
    cancel,
    polish,
    expand,
    shorten,
    translate,
    summarize,
    continueWriting
  };
}
