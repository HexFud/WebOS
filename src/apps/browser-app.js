// The real browser app: address bar, working history, and a sandboxed iframe for actual web pages (plus a couple of built-in "webos://" pages).
import { h, useEffect, useRef, useState } from '../lib/dom.js';
import { clamp } from '../lib/utils.js';

export function BrowserApp({ payload, onUpdate, showToast }) {
  const pages = {
    home: { title: 'WebOS Home', subtitle: 'La pagina iniziale del browser di WebOS.', body: ['Digita un indirizzo web (es. wikipedia.org) o un termine di ricerca nella barra sopra.', 'I siti che vietano il caricamento in iframe possono essere aperti in una nuova scheda con il pulsante dedicato.'] },
    docs: { title: 'Docs', subtitle: 'Note di sviluppo e documentazione di sistema.', body: ['Lo stato del desktop (file, note, sfondo, tema) viene salvato in locale.', 'Le finestre possono essere trascinate sui bordi dello schermo per agganciarle automaticamente.'] }
  };
  const history = payload.history && payload.history.length ? payload.history : [{ kind: 'internal', page: 'home' }];
  const historyIndex = clamp(typeof payload.historyIndex === 'number' ? payload.historyIndex : 0, 0, history.length - 1);
  const current = history[historyIndex];
  const currentPage = current.kind === 'internal' ? (pages[current.page] || pages.home) : null;

  const [addressInput, setAddressInput] = useState(payload.address || 'webos://home');
  const [loading, setLoading] = useState(current.kind === 'web');
  const iframeRef = useRef(null);

  useEffect(() => { setAddressInput(payload.address || 'webos://home'); }, [payload.address]);
  useEffect(() => { setLoading(current.kind === 'web'); }, [historyIndex, current.kind, current.kind === 'web' ? current.url : null]);

  function addressFor(entry) {
    return entry.kind === 'internal' ? `webos://${entry.page}` : entry.url;
  }

  function pushEntry(entry) {
    const truncated = history.slice(0, historyIndex + 1);
    const nextHistory = [...truncated, entry];
    onUpdate({ ...payload, history: nextHistory, historyIndex: nextHistory.length - 1, address: addressFor(entry) });
  }

  function goInternal(page) {
    pushEntry({ kind: 'internal', page });
  }

  function goToUrl(url) {
    pushEntry({ kind: 'web', url });
    showToast('Caricamento pagina', url);
  }

  function resolveInput(raw) {
    const value = raw.trim();
    if (!value) return;
    const bare = value.toLowerCase().replace(/^webos:\/\//, '');
    if (pages[bare]) return goInternal(bare);

    const isHttpUrl = /^https?:\/\//i.test(value);
    const looksLikeDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+(:\d+)?([/?#].*)?$/i.test(value);
    if (isHttpUrl) return goToUrl(value);
    if (looksLikeDomain) return goToUrl(`https://${value}`);
    return goToUrl(`https://duckduckgo.com/html/?q=${encodeURIComponent(value)}`);
  }

  function goBack() {
    if (historyIndex <= 0) return;
    const prev = history[historyIndex - 1];
    onUpdate({ ...payload, historyIndex: historyIndex - 1, address: addressFor(prev) });
  }

  function goForward() {
    if (historyIndex >= history.length - 1) return;
    const next = history[historyIndex + 1];
    onUpdate({ ...payload, historyIndex: historyIndex + 1, address: addressFor(next) });
  }

  function reload() {
    if (current.kind !== 'web') return;
    setLoading(true);
    if (iframeRef.current) iframeRef.current.src = current.url;
  }

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  return h('div', { className: 'browser-app' },
    h('div', { className: 'browser-toolbar' },
      h('button', { type: 'button', className: 'browser-nav-button browser-nav-button--icon', disabled: !canGoBack, onClick: goBack, title: 'Indietro', 'aria-label': 'Indietro' }, '←'),
      h('button', { type: 'button', className: 'browser-nav-button browser-nav-button--icon', disabled: !canGoForward, onClick: goForward, title: 'Avanti', 'aria-label': 'Avanti' }, '→'),
      h('button', { type: 'button', className: 'browser-nav-button browser-nav-button--icon', disabled: current.kind !== 'web', onClick: reload, title: 'Ricarica', 'aria-label': 'Ricarica' }, '⟳'),
      h('button', { type: 'button', className: 'browser-nav-button', onClick: () => goInternal('home') }, 'Home'),
      h('form', { className: 'browser-address-form', onSubmit: (event) => { event.preventDefault(); resolveInput(addressInput); } },
        h('input', { className: 'browser-address', value: addressInput, onChange: (event) => setAddressInput(event.target.value), spellCheck: false, autoComplete: 'off', placeholder: 'Cerca o digita un indirizzo web (es. wikipedia.org)' })
      ),
      current.kind === 'web' && h('a', { className: 'browser-nav-button browser-external-link', href: current.url, target: '_blank', rel: 'noopener noreferrer' }, 'Apri ↗')
    ),
    currentPage
      ? h('div', { className: 'browser-page' }, h('div', { className: 'browser-page-hero' }, h('div', { className: 'browser-page-tag' }, 'PAGINA INTERNA'), h('h2', null, currentPage.title), h('p', null, currentPage.subtitle)), h('div', { className: 'browser-card-grid' }, currentPage.body.map((text, index) => h('article', { className: 'browser-card', key: index }, text))))
      : h('div', { className: 'browser-frame-wrap' },
          loading && h('div', { className: 'browser-loading' }, h('div', { className: 'browser-loading-spinner' }), h('span', null, 'Caricamento…')),
          h('iframe', {
            key: current.url,
            ref: iframeRef,
            className: 'browser-frame',
            src: current.url,
            title: 'Contenuto web',
            onLoad: () => setLoading(false),
            sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
          }),
          h('div', { className: 'browser-frame-note' }, 'Alcuni siti bloccano la visualizzazione in iframe per motivi di sicurezza: usa "Apri ↗" per aprirli in una nuova scheda.')
        )
  );
}
