import { useState } from 'react';
import QbankModal from './QbankModal';

const QbankButton = ({ articleTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className="_4cc9ddf83d96bbf8--secondLevelLink" 
        data-e2e-test-id="qbank-sidebar-option"
        type="button"
        onClick={() => setIsModalOpen(true)}
      >
        Qbank
      </button>

      <QbankModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        articleTitle={articleTitle}
      />
    </>
  );
};

export default QbankButton;
