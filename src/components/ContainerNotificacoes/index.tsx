import Notificacao from '../Notificacao';

interface NotificacaoData {
  id: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  mensagem?: string;
  duracao?: number;
}

interface ContainerNotificacoesProps {
  notificacoes: NotificacaoData[];
  onRemover: (id: string) => void;
}

const ContainerNotificacoes = ({ notificacoes, onRemover }: ContainerNotificacoesProps) => {
  return (
    <>
      {notificacoes.map((notificacao) => (
        <Notificacao
          key={notificacao.id}
          tipo={notificacao.tipo}
          titulo={notificacao.titulo}
          mensagem={notificacao.mensagem}
          duracao={notificacao.duracao}
          onClose={() => onRemover(notificacao.id)}
          visivel={true}
        />
      ))}
    </>
  );
};

export default ContainerNotificacoes;
