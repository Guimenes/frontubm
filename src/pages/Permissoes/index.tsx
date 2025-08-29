import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Permissao, Perfil } from '../../types';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import ErrorState from '../../components/ErrorState';
import '../../components/Modal/ModalPermissoes.css';
import './styles.css';

const Permissoes = () => {
  const { hasPermission } = useAuth();
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [permissoesPorModulo, setPermissoesPorModulo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'permissoes' | 'perfis'>('permissoes');
  
  // Modais
  const [showPermissaoModal, setShowPermissaoModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [editingPermissao, setEditingPermissao] = useState<Permissao | null>(null);
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null);
  
  // Forms
  const [permissaoForm, setPermissaoForm] = useState({
    nome: '',
    codigo: '',
    modulo: '',
    descricao: '',
    ativo: true
  });
  
  const [perfilForm, setPerfilForm] = useState({
    nome: '',
    descricao: '',
    permissoes: [] as string[],
    ativo: true
  });

  // Verificar permissões
  const canListPermissoes = hasPermission('PERMISSOES_LISTAR');
  const canCreatePermissoes = hasPermission('PERMISSOES_CRIAR');
  const canEditPermissoes = hasPermission('PERMISSOES_EDITAR');
  const canDeletePermissoes = hasPermission('PERMISSOES_EXCLUIR');
  
  const canListPerfis = hasPermission('PERFIS_LISTAR');
  const canCreatePerfis = hasPermission('PERFIS_CRIAR');
  const canEditPerfis = hasPermission('PERFIS_EDITAR');
  const canDeletePerfis = hasPermission('PERFIS_EXCLUIR');

  useEffect(() => {
    if (canListPermissoes || canListPerfis) {
      carregarDados();
    }
  }, [canListPermissoes, canListPerfis]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      const promises = [];
      
      if (canListPermissoes) {
        promises.push(api.get('/permissoes'));
        promises.push(api.get('/permissoes/modulos'));
      }
      
      if (canListPerfis) {
        promises.push(api.get('/perfis'));
      }

      const responses = await Promise.all(promises);
      
      let responseIndex = 0;
      
      if (canListPermissoes) {
        responseIndex++; // Pular a primeira resposta de permissões
        const modulosResponse = responses[responseIndex++];
        
        if (modulosResponse.success) {
          setPermissoesPorModulo((modulosResponse.data as any[]) || []);
        } else {
          setError('Erro ao carregar módulos de permissões');
          return;
        }
      }
      
      if (canListPerfis && responses[responseIndex]) {
        const perfisResponse = responses[responseIndex];
        if (perfisResponse.success) {
          setPerfis((perfisResponse.data as Perfil[]) || []);
        } else {
          setError('Erro ao carregar perfis');
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro de conexão com o servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Funções para Permissões
  const handleSubmitPermissao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPermissao ? `/permissoes/${editingPermissao._id}` : '/permissoes';
      const method = editingPermissao ? 'put' : 'post';
      
      const response = await api[method](url, permissaoForm);

      if (response.success) {
        alert(response.message || 'Operação realizada com sucesso');
        setShowPermissaoModal(false);
        resetPermissaoForm();
        carregarDados();
      }
    } catch (error: any) {
      console.error('Erro ao salvar permissão:', error);
      const message = error.response?.data?.message || 'Erro ao salvar permissão';
      alert(message);
    }
  };

  const handleEditPermissao = (permissao: Permissao) => {
    if (!canEditPermissoes) return;
    
    setEditingPermissao(permissao);
    setPermissaoForm({
      nome: permissao.nome,
      codigo: permissao.codigo,
      modulo: permissao.modulo,
      descricao: permissao.descricao || '',
      ativo: permissao.ativo
    });
    setShowPermissaoModal(true);
  };

  const handleDeletePermissao = async (permissao: Permissao) => {
    if (!canDeletePermissoes) return;
    
    const confirmDelete = window.confirm(`Tem certeza que deseja desativar a permissão ${permissao.nome}?`);
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/permissoes/${permissao._id}`);
      if (response.success) {
        alert(response.message || 'Permissão desativada com sucesso');
        carregarDados();
      }
    } catch (error: any) {
      console.error('Erro ao excluir permissão:', error);
      const message = error.response?.data?.message || 'Erro ao excluir permissão';
      alert(message);
    }
  };

  // Funções para Perfis
  const handleSubmitPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPerfil ? `/perfis/${editingPerfil._id}` : '/perfis';
      const method = editingPerfil ? 'put' : 'post';
      
      const response = await api[method](url, perfilForm);

      if (response.success) {
        alert(response.message || 'Operação realizada com sucesso');
        setShowPerfilModal(false);
        resetPerfilForm();
        carregarDados();
      }
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      const message = error.response?.data?.message || 'Erro ao salvar perfil';
      alert(message);
    }
  };

  const handleEditPerfil = (perfil: Perfil) => {
    if (!canEditPerfis) return;
    
    setEditingPerfil(perfil);
    setPerfilForm({
      nome: perfil.nome,
      descricao: perfil.descricao || '',
      permissoes: Array.isArray(perfil.permissoes) 
        ? perfil.permissoes.map((p: any) => typeof p === 'string' ? p : p._id || '') 
        : [],
      ativo: perfil.ativo
    });
    setShowPerfilModal(true);
  };

  const handleDeletePerfil = async (perfil: Perfil) => {
    if (!canDeletePerfis) return;
    
    const confirmDelete = window.confirm(`Tem certeza que deseja desativar o perfil ${perfil.nome}?`);
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/perfis/${perfil._id}`);
      if (response.success) {
        alert(response.message || 'Perfil desativado com sucesso');
        carregarDados();
      }
    } catch (error: any) {
      console.error('Erro ao excluir perfil:', error);
      const message = error.response?.data?.message || 'Erro ao excluir perfil';
      alert(message);
    }
  };

  // Reset forms
  const resetPermissaoForm = () => {
    setPermissaoForm({
      nome: '',
      codigo: '',
      modulo: '',
      descricao: '',
      ativo: true
    });
    setEditingPermissao(null);
  };

  const resetPerfilForm = () => {
    setPerfilForm({
      nome: '',
      descricao: '',
      permissoes: [],
      ativo: true
    });
    setEditingPerfil(null);
  };

  const handlePermissaoChange = (permissaoId: string, checked: boolean) => {
    if (checked) {
      setPerfilForm(prev => ({
        ...prev,
        permissoes: [...prev.permissoes, permissaoId]
      }));
    } else {
      setPerfilForm(prev => ({
        ...prev,
        permissoes: prev.permissoes.filter(id => id !== permissaoId)
      }));
    }
  };

  if (!canListPermissoes && !canListPerfis) {
    return (
      <div className="permissoes-container">
        <div className="access-denied">
          <h2>Acesso Negado</h2>
          <p>Você não tem permissão para visualizar permissões ou perfis.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Carregando dados...</div>;
  }

  if (error) {
    return (
      <div className="permissoes-container">
        <ErrorState
          message={error}
          onRetry={carregarDados}
        />
      </div>
    );
  }

  return (
    <div className="permissoes-container">
      <div className="permissoes-header">
        <h1>Gerenciamento de Permissões e Perfis</h1>
      </div>

      <div className="tabs">
        {canListPermissoes && (
          <button 
            className={`tab ${activeTab === 'permissoes' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissoes')}
          >
            Permissões
          </button>
        )}
        {canListPerfis && (
          <button 
            className={`tab ${activeTab === 'perfis' ? 'active' : ''}`}
            onClick={() => setActiveTab('perfis')}
          >
            Perfis
          </button>
        )}
      </div>

      {activeTab === 'permissoes' && canListPermissoes && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Permissões</h2>
            {canCreatePermissoes && (
              <button 
                className="btn-primary"
                onClick={() => setShowPermissaoModal(true)}
              >
                Nova Permissão
              </button>
            )}
          </div>

          <div className="modulos-grid">
            {permissoesPorModulo.map((modulo) => (
              <div key={modulo._id} className="modulo-card">
                <h3 className="modulo-title">{modulo._id}</h3>
                <div className="permissoes-list">
                  {modulo.permissoes.map((permissao: any) => (
                    <div key={permissao._id} className="permissao-item">
                      <div className="permissao-info">
                        <span className="permissao-nome">{permissao.nome}</span>
                        <span className="permissao-codigo">{permissao.codigo}</span>
                        {permissao.descricao && (
                          <span className="permissao-desc">{permissao.descricao}</span>
                        )}
                      </div>
                      <div className="permissao-actions">
                        {canEditPermissoes && (
                          <button 
                            className="btn-edit-small"
                            onClick={() => handleEditPermissao(permissao)}
                          >
                            Editar
                          </button>
                        )}
                        {canDeletePermissoes && (
                          <button 
                            className="btn-delete-small"
                            onClick={() => handleDeletePermissao(permissao)}
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'perfis' && canListPerfis && (
        <div className="tab-content">
          <div className="section-header">
            <h2>Perfis</h2>
            {canCreatePerfis && (
              <button 
                className="btn-primary"
                onClick={() => setShowPerfilModal(true)}
              >
                Novo Perfil
              </button>
            )}
          </div>

          <div className="perfis-grid">
            {perfis.map((perfil) => (
              <div key={perfil._id} className="perfil-card">
                <div className="perfil-info">
                  <h3>{perfil.nome}</h3>
                  {perfil.descricao && <p className="perfil-desc">{perfil.descricao}</p>}
                  <span className={`status ${perfil.ativo ? 'ativo' : 'inativo'}`}>
                    {perfil.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="perfil-permissoes">
                    <span className="permissoes-count">
                      {Array.isArray(perfil.permissoes) ? perfil.permissoes.length : 0} permissões
                    </span>
                  </div>
                </div>
                <div className="perfil-actions">
                  {canEditPerfis && (
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditPerfil(perfil)}
                    >
                      Editar
                    </button>
                  )}
                  {canDeletePerfis && perfil.ativo && (
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeletePerfil(perfil)}
                    >
                      Desativar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Permissão */}
      {showPermissaoModal && (
        <Modal
          isOpen={showPermissaoModal}
          title={editingPermissao ? 'Editar Permissão' : 'Nova Permissão'}
          onClose={() => {
            setShowPermissaoModal(false);
            resetPermissaoForm();
          }}
          className="modal-permissoes"
        >
          <form onSubmit={handleSubmitPermissao} className="permissao-form">
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                value={permissaoForm.nome}
                onChange={(e) => setPermissaoForm({ ...permissaoForm, nome: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="codigo">Código:</label>
              <input
                type="text"
                id="codigo"
                value={permissaoForm.codigo}
                onChange={(e) => setPermissaoForm({ ...permissaoForm, codigo: e.target.value.toUpperCase() })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modulo">Módulo:</label>
              <select
                id="modulo"
                value={permissaoForm.modulo}
                onChange={(e) => setPermissaoForm({ ...permissaoForm, modulo: e.target.value })}
                required
              >
                <option value="">Selecione um módulo</option>
                <option value="locais">Locais</option>
                <option value="eventos">Eventos</option>
                <option value="cursos">Cursos</option>
                <option value="usuarios">Usuários</option>
                <option value="permissoes">Permissões</option>
                <option value="relatorios">Relatórios</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição:</label>
              <textarea
                id="descricao"
                value={permissaoForm.descricao}
                onChange={(e) => setPermissaoForm({ ...permissaoForm, descricao: e.target.value })}
                rows={3}
              />
            </div>

            {editingPermissao && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={permissaoForm.ativo}
                    onChange={(e) => setPermissaoForm({ ...permissaoForm, ativo: e.target.checked })}
                  />
                  Permissão ativa
                </label>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowPermissaoModal(false);
                  resetPermissaoForm();
                }} 
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingPermissao ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Perfil */}
      {showPerfilModal && (
        <Modal
          isOpen={showPerfilModal}
          title={editingPerfil ? 'Editar Perfil' : 'Novo Perfil'}
          onClose={() => {
            setShowPerfilModal(false);
            resetPerfilForm();
          }}
          size="large"
          className="modal-permissoes"
        >
          <form onSubmit={handleSubmitPerfil} className="perfil-form">
            <div className="form-group">
              <label htmlFor="nome">Nome:</label>
              <input
                type="text"
                id="nome"
                value={perfilForm.nome}
                onChange={(e) => setPerfilForm({ ...perfilForm, nome: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição:</label>
              <textarea
                id="descricao"
                value={perfilForm.descricao}
                onChange={(e) => setPerfilForm({ ...perfilForm, descricao: e.target.value })}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Permissões:</label>
              <div className="permissoes-selection">
                {permissoesPorModulo.map((modulo) => (
                  <div key={modulo._id} className="modulo-section">
                    <h4 className="modulo-header">{modulo._id}</h4>
                    <div className="permissoes-checkboxes">
                      {modulo.permissoes.map((permissao: any) => (
                        <label key={permissao._id} className="checkbox-item">
                          <input
                            type="checkbox"
                            checked={perfilForm.permissoes.includes(permissao._id)}
                            onChange={(e) => handlePermissaoChange(permissao._id, e.target.checked)}
                          />
                          <span className="checkbox-label">
                            {permissao.nome}
                            <small>({permissao.codigo})</small>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {editingPerfil && (
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={perfilForm.ativo}
                    onChange={(e) => setPerfilForm({ ...perfilForm, ativo: e.target.checked })}
                  />
                  Perfil ativo
                </label>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowPerfilModal(false);
                  resetPerfilForm();
                }} 
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingPerfil ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Permissoes;
