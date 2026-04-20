/** @jsxImportSource @emotion/react */
import React from 'react';
import ReactDOM from 'react-dom/client';
import QbankModal from './QbankModal.jsx';

// Estado para manejar el modal
let modalRoot = null;
let isModalOpen = false;

function QbankModalManager() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [articleTitle, setArticleTitle] = React.useState('');

  React.useEffect(() => {
    // Exponer funciones globales para abrir el modal desde HTML
    window.openQbankModal = (title) => {
      setArticleTitle(title || document.querySelector('._62af53fea5b31646--headerTitle')?.textContent || '');
      setIsOpen(true);
    };

    window.closeQbankModal = () => {
      setIsOpen(false);
    };

    return () => {
      delete window.openQbankModal;
      delete window.closeQbankModal;
    };
  }, []);

  return (
    <QbankModal 
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      articleTitle={articleTitle}
    />
  );
}

// Inicializar React cuando el DOM esté listo
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Crear un contenedor para React
    const modalContainer = document.createElement('div');
    modalContainer.id = 'qbank-modal-root';
    document.body.appendChild(modalContainer);

    // Montar el componente React
    modalRoot = ReactDOM.createRoot(modalContainer);
    modalRoot.render(<QbankModalManager />);

    console.log('✅ Qbank Modal React integration initialized');
  });
}
