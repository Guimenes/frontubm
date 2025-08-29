import React, { useEffect } from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface ModalConfirmacaoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensagem: string;
  tipo?: 'danger' | 'warning' | 'info';
  textoBotaoConfirmar?: string;
  textoBotaoCancelar?: string;
  carregando?: boolean;
}

export default function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensagem,
  tipo = 'warning',
  textoBotaoConfirmar = 'Confirmar',
  textoBotaoCancelar = 'Cancelar',
  carregando = false
}: ModalConfirmacaoProps) {
  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getIcon = () => {
    switch (tipo) {
      case 'danger':
        return 'warning';
      case 'warning':
        return 'help_outline';
      case 'info':
        return 'info_outline';
      default:
        return 'help_outline';
    }
  };

  const getIconColor = () => {
    switch (tipo) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
        return '#3b82f6';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div className="modal-confirmacao-overlay" onClick={handleOverlayClick}>
      <div className="modal-confirmacao-content">
        <div className="modal-confirmacao-header">
          <div className="modal-confirmacao-icon" style={{ color: getIconColor() }}>
            <MaterialIcon name={getIcon()} />
          </div>
          <h3 className="modal-confirmacao-titulo">{titulo}</h3>
        </div>

        <div className="modal-confirmacao-body">
          <p className="modal-confirmacao-mensagem">{mensagem}</p>
        </div>

        <div className="modal-confirmacao-footer">
          <button
            onClick={onClose}
            className="btn-modal-cancelar"
            disabled={carregando}
          >
            <MaterialIcon name="close" />
            {textoBotaoCancelar}
          </button>
          
          <button
            onClick={onConfirm}
            className={`btn-modal-confirmar ${tipo}`}
            disabled={carregando}
          >
            {carregando ? (
              <>
                <div className="loading-spinner"></div>
                Processando...
              </>
            ) : (
              <>
                <MaterialIcon name="check" />
                {textoBotaoConfirmar}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
