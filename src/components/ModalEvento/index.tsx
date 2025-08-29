import React from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface ModalEventoProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalEvento: React.FC<ModalEventoProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-evento-overlay" onClick={handleOverlayClick}>
      <div className="modal-evento-content">
        <div className="modal-evento-header">
          <div className="modal-evento-header-content">
            <div className="modal-evento-icon">
              <MaterialIcon name="event" />
            </div>
            <div className="modal-evento-title-area">
              <h2 className="modal-evento-title">{title}</h2>
              <p className="modal-evento-subtitle">Preencha as informações do evento</p>
            </div>
          </div>
          <button 
            className="modal-evento-close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        
        <div className="modal-evento-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalEvento;
