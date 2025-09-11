import React from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ModalUsuario: React.FC<ModalUsuarioProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-usuario-overlay" aria-modal="true" role="dialog">
      <div className="modal-usuario-container">
        <div className="modal-usuario-header">
          <div className="modal-usuario-title">
            <MaterialIcon name="person" />
            <h2>{title}</h2>
          </div>
          <button 
            className="modal-usuario-close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            <MaterialIcon name="close" />
          </button>
        </div>
        
        <div className="modal-usuario-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalUsuario;
