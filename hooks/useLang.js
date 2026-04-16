import { useState, useEffect } from 'react';

const LS_KEY = 'tal_lang';
const SUPPORTED = ['en', 'zh', 'es', 'vi', 'hi', 'fr', 'de', 'ja', 'ko'];

export function useLang() {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved && SUPPORTED.includes(saved)) setLangState(saved);

    function onStorage(e) {
      if (e.key === LS_KEY && e.newValue && SUPPORTED.includes(e.newValue)) {
        setLangState(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function setLang(l) {
    if (!SUPPORTED.includes(l)) return;
    setLangState(l);
    localStorage.setItem(LS_KEY, l);
  }

  return [lang, setLang];
}
