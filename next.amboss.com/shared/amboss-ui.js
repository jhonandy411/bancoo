(function() {
  console.log('🔄 AmbossUI: Loading script...');
  
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('❌ AmbossUI: React or ReactDOM not found. Make sure they are loaded before this script.');
    return;
  }

  const { createElement: e } = React;
  
  // Try to find emotion global
  const emotion = window.emotion || window.emotionCss || window['@emotion/css'];
  let css, keyframes;

  if (emotion) {
    css = emotion.css;
    keyframes = emotion.keyframes;
  } else {
    console.warn('⚠️ AmbossUI: Emotion not found, using CSS fallback.');
    // Fallback: Inject CSS if Emotion is missing
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes amb-dash { to { stroke-dashoffset: 136; } }
.amb-spinner{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:100px;
  height:100px;
  transform-origin: 50% 65%;
}      .amb-spinner polygon { stroke: #008770; stroke-dasharray: 17; animation: amb-dash 2s linear infinite; }
    `;
    document.head.appendChild(style);
  }

  function LoadingSpinner({ size = 100 }) {
const className = css ? css`
  width: ${size}px;
  height: ${size}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: 50% 65%;
` : 'amb-spinner';

    const polyClass = css ? css`
      stroke: #008770;
      stroke-dasharray: 17;
      animation: ${keyframes`to { stroke-dashoffset: 136; }`} 2s linear infinite;
    ` : '';

    return e('div', { className: className },
      e('svg', {
        width: size,
        height: size,
        viewBox: "-3 -4 39 39",
        "aria-hidden": "true"
      },
        e('polygon', {
          className: polyClass,
          fill: "transparent",
          strokeWidth: "1",
          points: "16,0 32,32 0,32"
        })
      )
    );
  }

  const DEFAULTS = {
  size: 60,     // 👈 tu tamaño por defecto
  padding: 40   // (opcional) si querés helper para el wrapper
};

  // Global UI utilities
window.AmbossUI = {
  defaults: DEFAULTS,

  renderSpinner: function(container, size) {
    if (!container) return;
    const finalSize = Number(size ?? this.defaults.size);
    const root = ReactDOM.createRoot(container);
    root.render(e(LoadingSpinner, { size: finalSize }));
    container._ambSpinnerRoot = root;
  },

  initLoadingSpinners: function() {
    document.querySelectorAll('[data-loading-spinner]').forEach(el => {
      if (el._ambSpinnerRoot) return;
      const attr = el.getAttribute('data-size');
      const size = attr ? parseInt(attr, 10) : this.defaults.size; // 👈 default si no hay attr
      this.renderSpinner(el, size);
    });
  }
};
})();
