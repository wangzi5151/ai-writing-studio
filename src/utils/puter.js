let loadPromise = null;

/**
 * Puter.js (the free AI backend) is loaded on demand only when the user opens
 * the AI assistant. The editor itself is fully bundled and works offline.
 */
export function loadPuter() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('AI service is not available'));
  }
  if (window.puter) return Promise.resolve(window.puter);
  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      script.onload = () => {
        if (window.puter) {
          resolve(window.puter);
        } else {
          loadPromise = null;
          reject(new Error('AI service is not available'));
        }
      };
      script.onerror = () => {
        loadPromise = null;
        reject(new Error('Failed to load the AI service'));
      };
      document.head.appendChild(script);
    });
  }
  return loadPromise;
}
