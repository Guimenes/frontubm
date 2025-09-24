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
      const currentVersion = '1.1.3';
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
    localStorage.setItem('ubm-last-seen-version', '1.1.3');
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
                Sistema de Seminários UBM - Versão 1.1.3
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
                  Versão 1.1.3 (Atual)
                  {isFirstVisit && <span className="current-version-badge">ATUAL</span>}
                </h3>
                <p><strong>Data de lançamento:</strong> 24 de setembro de 2025</p>
                
                <h4>🔒 Melhorias de Segurança:</h4>
                <ul>
                  <li><strong>Middleware de Autenticação:</strong> Implementação de autenticação obrigatória em todas as rotas POST, PUT e DELETE</li>
                  <li><strong>Tratamento Seguro de Erros:</strong> Sistema de error handler centralizado para prevenir vazamento de informações sensíveis</li>
                  <li><strong>Criptografia de Dados:</strong> Implementação de sistema de hash e criptografia para respostas de API GET</li>
                  <li><strong>Proteção Admin:</strong> Rotas DELETE agora requerem token de administrador para operações críticas</li>
                  <li><strong>CORS Cloudflare:</strong> Configuração específica de CORS para integração com Cloudflare Workers</li>
                </ul>

                <h4>🛡️ Hardening de Segurança:</h4>
                <ul>
                  <li>Remoção de todos os console.log que poderiam vazar informações sensíveis</li>
                  <li>Headers de segurança aprimorados com Helmet.js configurado para produção</li>
                  <li>Rate limiting implementado para proteção contra ataques de força bruta</li>
                  <li>Validação rigorosa de origem de requisições</li>
                </ul>

                <h4>⚙️ Configurações de Produção:</h4>
                <ul>
                  <li>Chaves JWT e criptografia geradas com crypto.randomBytes para máxima segurança</li>
                  <li>Configurações específicas para ambiente de produção</li>
                  <li>Integração otimizada com Cloudflare Workers</li>
                </ul>
              </div>
              
              <div className="version-section">
                <h3>Versão 1.1.2</h3>
                <p><strong>Data de lançamento:</strong> 22 de setembro de 2025</p>
                
                <h4>🌟 Novos Recursos:</h4>
                <ul>
                  <li><strong>Eventos com múltiplos cursos:</strong> Agora é possível criar eventos que abrangem vários cursos simultaneamente</li>
                  <li><strong>Eventos gerais:</strong> Suporte a eventos que não estão vinculados a cursos específicos</li>
                  <li><strong>Cronograma com eventos concorrentes:</strong> Visualização aprimorada que exibe eventos simultâneos lado a lado</li>
                </ul>

                <h4>✨ Melhorias na Interface:</h4>
                <ul>
                  <li>Cards do cronograma agora exibem eventos simultâneos de forma mais organizada</li>
                  <li>Melhor responsividade dos cards em diferentes tamanhos de tela</li>
                  <li>Interface mais limpa com remoção da duração dos cards (mantida apenas nos detalhes)</li>
                  <li>Organização aprimorada dos grupos de eventos por curso</li>
                </ul>

                <h4>🛠️ Correções:</h4>
                <ul>
                  <li>Corrigido problema com slots de 30 minutos sendo cortados no cronograma</li>
                  <li>Ajustes na lógica de cálculo visual dos eventos simultâneos</li>
                  <li>Melhorias na filtragem de eventos por múltiplos cursos</li>
                </ul>

                <h4>⚡ Otimizações:</h4>
                <ul>
                  <li>Algoritmo aprimorado para geração de horários de 30 em 30 minutos</li>
                  <li>Melhor performance na renderização do cronograma com muitos eventos</li>
                  <li>Cálculo mais preciso dos slots visuais para eventos sobrepostos</li>
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
