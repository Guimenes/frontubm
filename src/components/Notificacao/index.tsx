import { useEffect } from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface NotificacaoProps {
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  mensagem?: string;
  duracao?: number;
  onClose: () => void;
  visivel: boolean;
}

const Notificacao = ({ 
  tipo, 
  titulo, 
  mensagem, 
  duracao = 4000, 
  onClose, 
  visivel 
}: NotificacaoProps) => {
  useEffect(() => {
    if (visivel && duracao > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duracao);

      return () => clearTimeout(timer);
    }
  }, [visivel, duracao, onClose]);

  if (!visivel) return null;

  const getIcone = () => {
    switch (tipo) {
      case 'sucesso':
        return 'check_circle';
      case 'erro':
        return 'error';
      case 'aviso':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <div className={`notificacao ${tipo} ${visivel ? 'visivel' : ''}`}>
      <div className="notificacao-container">
        <div className="notificacao-icone">
          <MaterialIcon name={getIcone()} />
        </div>
        
        <div className="notificacao-conteudo">
          <h4 className="notificacao-titulo">{titulo}</h4>
          {mensagem && (
            <p className="notificacao-mensagem">{mensagem}</p>
          )}
        </div>
        
        <button 
          className="notificacao-fechar" 
          onClick={onClose}
          type="button"
          aria-label="Fechar notificação"
        >
          <MaterialIcon name="close" />
        </button>
      </div>
      
      {duracao > 0 && (
        <div 
          className="notificacao-progresso" 
          style={{ animationDuration: `${duracao}ms` }}
        />
      )}
    </div>
  );
};

export default Notificacao;
