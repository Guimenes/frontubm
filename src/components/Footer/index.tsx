import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './styles.css';

const Footer = () => {
  const { isAuthenticated } = useAuth();
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Só verifica primeira visita se o usuário estiver logado
    if (!isAuthenticated) {
      // Se não estiver logado, limpa os estados
      setIsFirstVisit(false);
      setShowReleaseNotes(false);
      return;
    }

    // Pequeno delay para garantir que o contexto de auth seja totalmente carregado
    const timer = setTimeout(() => {
      // Verifica se é a primeira visita do usuário
      const hasVisited = localStorage.getItem('ubm-system-visited');
      const currentVersion = '1.1.1';
      const lastSeenVersion = localStorage.getItem('ubm-last-seen-version');
      
      // Mostra o modal se:
      // 1. Nunca visitou antes OU
      // 2. A última versão vista é diferente da atual
      if (!hasVisited || lastSeenVersion !== currentVersion) {
        console.log('Primeira visita ou nova versão detectada:', { hasVisited, lastSeenVersion, currentVersion });
        setIsFirstVisit(true);
        setShowReleaseNotes(true);
      } else {
        console.log('Usuário já viu esta versão');
        setIsFirstVisit(false);
      }
    }, 500); // Delay de 500ms

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleVersionClick = () => {
    setShowReleaseNotes(true);
  };

  // Função para resetar localStorage (para testes)
  const resetFirstVisit = () => {
    localStorage.removeItem('ubm-system-visited');
    localStorage.removeItem('ubm-last-seen-version');
    console.log('localStorage resetado para testes');
    // Re-executa a verificação
    if (isAuthenticated) {
      setIsFirstVisit(true);
      setShowReleaseNotes(true);
    }
  };

  // Adiciona tecla de atalho para resetar (Ctrl+Shift+R para desenvolvedores)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        resetFirstVisit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAuthenticated]);

  const closeReleaseNotes = () => {
    console.log('Fechando modal de notas de versão');
    setShowReleaseNotes(false);
    // Marca que o usuário visitou e viu a versão atual
    localStorage.setItem('ubm-system-visited', 'true');
    localStorage.setItem('ubm-last-seen-version', '1.1.1');
    setIsFirstVisit(false);
    console.log('localStorage atualizado:', {
      visited: localStorage.getItem('ubm-system-visited'),
      version: localStorage.getItem('ubm-last-seen-version')
    });
  };

  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            <p>&copy; 2025 Nova UBM - Todos os direitos reservados.</p>
            {isAuthenticated && (
              <p className="version-info" onClick={handleVersionClick}>
                Sistema de Seminários UBM - Versão 1.1.1
                {isFirstVisit && <span className="new-badge">NOVO!</span>}
              </p>
            )}
          </div>
        </div>
      </footer>

      {showReleaseNotes && (
        <div className="release-notes-modal" onClick={closeReleaseNotes}>
          <div className="release-notes-content" onClick={(e) => e.stopPropagation()}>
            <div className="release-notes-header">
              <h2>
                Notas de Versão - Sistema de Seminários UBM
                {isFirstVisit && <span className="new-badge-header">NOVIDADE!</span>}
              </h2>
              <button className="close-btn" onClick={closeReleaseNotes}>×</button>
            </div>
            <div className="release-notes-body">
              {isFirstVisit && (
                <div className="welcome-message">
                  <h3>🎉 Bem-vindo ao Sistema de Seminários UBM!</h3>
                  <p>Esta é uma nova atualização com várias melhorias. Confira as novidades abaixo:</p>
                </div>
              )}
              
              <div className="version-section">
                <h3>
                  Versão 1.1.1 (Atual)
                  {isFirstVisit && <span className="current-version-badge">ATUAL</span>}
                </h3>
                <p><strong>Data de lançamento:</strong> 29 de agosto de 2025</p>
                
                <h4>🌟 Novos Recursos:</h4>
                <ul>
                  <li>Novo componente ErrorState para melhor feedback de erros</li>
                  <li>Novo componente LoadingState para estados de carregamento</li>
                  <li>Sistema de animações aprimorado para feedback visual</li>
                </ul>

                <h4>✨ Melhorias na Interface:</h4>
                <ul>
                  <li>Redesign do estado de erro com ícones e animações</li>
                  <li>Estado de carregamento mais moderno e consistente</li>
                  <li>Cores padronizadas seguindo a identidade visual UBM</li>
                  <li>Melhor contraste e legibilidade</li>
                </ul>

                <h4>🛠️ Correções:</h4>
                <ul>
                  <li>Ajuste nas cores do tema escuro para manter consistência</li>
                  <li>Correção na exibição de mensagens de erro</li>
                  <li>Padronização das animações de carregamento</li>
                </ul>

                <h4>⚡ Otimizações:</h4>
                <ul>
                  <li>Melhor experiência de usuário durante carregamentos</li>
                  <li>Feedback mais claro em casos de erro</li>
                  <li>Transições mais suaves entre estados</li>
                </ul>
              </div>
              
              <div className="version-section">
                <h3>Versão 1.1.0</h3>
                <p><strong>Data de lançamento:</strong> 15 de agosto de 2025</p>
                <h4>Novas funcionalidades:</h4>
                <ul>
                  <li>Sistema de gerenciamento de eventos aprimorado</li>
                  <li>Novo módulo de relatórios</li>
                  <li>Integração com calendário</li>
                </ul>
                <h4>Correções:</h4>
                <ul>
                  <li>Correção na validação de formulários</li>
                  <li>Melhoria na sincronização de dados</li>
                </ul>
              </div>

              <div className="version-section">
                <h3>Versão 1.0.0</h3>
                <p><strong>Data de lançamento:</strong> 1 de agosto de 2025</p>
                <h4>Lançamento inicial:</h4>
                <ul>
                  <li>Sistema base de gerenciamento de seminários</li>
                  <li>Cadastro de usuários e permissões</li>
                  <li>Gerenciamento de cursos e eventos</li>
                  <li>Sistema de autenticação</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
