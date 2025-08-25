import { useState, useCallback } from 'react';

interface NotificacaoData {
  id: string;
  tipo: 'sucesso' | 'erro' | 'aviso' | 'info';
  titulo: string;
  mensagem?: string;
  duracao?: number;
}

export const useNotificacao = () => {
  const [notificacoes, setNotificacoes] = useState<NotificacaoData[]>([]);

  const adicionarNotificacao = useCallback((notificacao: Omit<NotificacaoData, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const novaNotificacao: NotificacaoData = {
      id,
      duracao: 4000,
      ...notificacao
    };

    setNotificacoes(prev => [...prev, novaNotificacao]);

    // Auto remover após a duração especificada
    if (novaNotificacao.duracao && novaNotificacao.duracao > 0) {
      setTimeout(() => {
        removerNotificacao(id);
      }, novaNotificacao.duracao);
    }

    return id;
  }, []);

  const removerNotificacao = useCallback((id: string) => {
    setNotificacoes(prev => prev.filter(n => n.id !== id));
  }, []);

  const limparNotificacoes = useCallback(() => {
    setNotificacoes([]);
  }, []);

  // Métodos de conveniência
  const sucesso = useCallback((titulo: string, mensagem?: string, duracao?: number) => {
    return adicionarNotificacao({ tipo: 'sucesso', titulo, mensagem, duracao });
  }, [adicionarNotificacao]);

  const erro = useCallback((titulo: string, mensagem?: string, duracao?: number) => {
    return adicionarNotificacao({ tipo: 'erro', titulo, mensagem, duracao });
  }, [adicionarNotificacao]);

  const aviso = useCallback((titulo: string, mensagem?: string, duracao?: number) => {
    return adicionarNotificacao({ tipo: 'aviso', titulo, mensagem, duracao });
  }, [adicionarNotificacao]);

  const info = useCallback((titulo: string, mensagem?: string, duracao?: number) => {
    return adicionarNotificacao({ tipo: 'info', titulo, mensagem, duracao });
  }, [adicionarNotificacao]);

  return {
    notificacoes,
    adicionarNotificacao,
    removerNotificacao,
    limparNotificacoes,
    sucesso,
    erro,
    aviso,
    info
  };
};
