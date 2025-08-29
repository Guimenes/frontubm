import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Usuario, Perfil } from '../../types';
import { api } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import ModalConfirmacao from '../ModalConfirmacao';
import './styles.css';

interface ListaUsuarioProps {
  filtros: {
    busca?: string;
    perfil?: string;
    status?: string;
  };
  onEditar: (usuario: Usuario) => void;
  atualizar: boolean;
  onAtualizarComplete: () => void;
  onSucesso?: (titulo: string, mensagem?: string) => void;
  onErro?: (titulo: string, mensagem?: string) => void;
}

const ListaUsuario = ({ filtros, onEditar, atualizar, onAtualizarComplete, onSucesso, onErro }: ListaUsuarioProps) => {
  const { hasPermission, user } = useAuth();
  const [usuarios, setUsuarios] = useState<{ [key: string]: Usuario[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    usuario: null as Usuario | null,
    carregando: false
  });

  const canEdit = hasPermission('USUARIOS_EDITAR');
  const canDelete = hasPermission('USUARIOS_EXCLUIR');

  useEffect(() => {
    carregarUsuarios();
  }, [filtros, atualizar]);

  useEffect(() => {
    if (atualizar) {
      onAtualizarComplete();
    }
  }, [atualizar, onAtualizarComplete]);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/usuarios');
      
      if (response.success && Array.isArray(response.data)) {
        let usuariosFiltrados = response.data;

        // Aplicar filtros
        if (filtros.busca) {
          const busca = filtros.busca.toLowerCase();
          usuariosFiltrados = usuariosFiltrados.filter((usuario: Usuario) =>
            usuario.nome.toLowerCase().includes(busca) ||
            usuario.email.toLowerCase().includes(busca)
          );
        }

        if (filtros.perfil) {
          usuariosFiltrados = usuariosFiltrados.filter((usuario: Usuario) => {
            const perfilId = typeof usuario.perfil === 'string' ? usuario.perfil : usuario.perfil._id;
            return perfilId === filtros.perfil;
          });
        }

        if (filtros.status) {
          const statusBoolean = filtros.status === 'ativo';
          usuariosFiltrados = usuariosFiltrados.filter((usuario: Usuario) =>
            usuario.ativo === statusBoolean
          );
        }

        // Agrupar usuários por perfil e ordenar por nome
        const usuariosAgrupados = usuariosFiltrados.reduce((grupos: any, usuario: Usuario) => {
          const perfilNome = getPerfilNome(usuario.perfil);
          if (!grupos[perfilNome]) {
            grupos[perfilNome] = [];
          }
          grupos[perfilNome].push(usuario);
          return grupos;
        }, {});

        // Ordenar usuários dentro de cada grupo
        Object.keys(usuariosAgrupados).forEach(perfil => {
          usuariosAgrupados[perfil].sort((a: Usuario, b: Usuario) => a.nome.localeCompare(b.nome));
        });

        setUsuarios(usuariosAgrupados);
      } else {
        setUsuarios({});
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
      setUsuarios({});
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!canDelete) return;
    
    setModalConfirmacao({
      isOpen: true,
      usuario: usuario,
      carregando: false
    });
  };

  const confirmarAlteracaoStatus = async () => {
    if (!modalConfirmacao.usuario) return;

    setModalConfirmacao(prev => ({ ...prev, carregando: true }));

    try {
      const response = await api.delete(`/usuarios/${modalConfirmacao.usuario._id}`);
      if (response.success) {
        const action = modalConfirmacao.usuario.ativo ? 'desativado' : 'ativado';
        onSucesso?.(
          `Usuário ${action} com sucesso`,
          `O usuário ${modalConfirmacao.usuario.nome} foi ${action} com sucesso.`
        );
        carregarUsuarios();
        setModalConfirmacao({
          isOpen: false,
          usuario: null,
          carregando: false
        });
      }
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      const action = modalConfirmacao.usuario.ativo ? 'desativar' : 'ativar';
      const message = error.response?.data?.message || `Erro ao ${action} usuário`;
      onErro?.('Erro na operação', message);
      setModalConfirmacao(prev => ({ ...prev, carregando: false }));
    }
  };

  const cancelarAlteracaoStatus = () => {
    setModalConfirmacao({
      isOpen: false,
      usuario: null,
      carregando: false
    });
  };

  const formatarDataUltimoLogin = (data?: Date) => {
    if (!data) return 'Nunca';
    
    const dataLogin = new Date(data);
    return dataLogin.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPerfilNome = (perfil: string | Perfil): string => {
    if (typeof perfil === 'string') {
      return 'Carregando...';
    }
    return perfil.nome;
  };

  if (loading) {
    return (
      <div className="lista-usuario-loading">
        <MaterialIcon name="hourglass_empty" />
        <span>Carregando usuários...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-usuario-error">
        <MaterialIcon name="error_outline" />
        <span>{error}</span>
        <button onClick={carregarUsuarios} className="btn btn-primary">
          <MaterialIcon name="refresh" />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (Object.keys(usuarios).length === 0) {
    return (
      <div className="lista-usuario-empty">
        <MaterialIcon name="person_outline" />
        <h3>Nenhum usuário encontrado</h3>
        <p>
          {Object.values(filtros).some(Boolean)
            ? 'Tente ajustar os filtros para encontrar usuários.'
            : 'Não há usuários cadastrados no sistema.'}
        </p>
      </div>
    );
  }

  return (
    <div className="lista-usuario">
      <div className="usuarios-container">
        {Object.entries(usuarios).map(([perfilNome, usuariosGrupo]) => (
          <div key={perfilNome} className="secao-tipo-perfil">
            <div className="secao-header">
              <div className="secao-titulo">
                <h3>
                  <MaterialIcon name="account_circle" />
                  {perfilNome}
                </h3>
              </div>
              <div className="contador-usuarios">
                {usuariosGrupo.length} usuário{usuariosGrupo.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="usuarios-grid">
              {usuariosGrupo.map((usuario) => (
                <div key={usuario._id} className={`usuario-card ${!usuario.ativo ? 'inativo' : ''}`}>
                  <div className="usuario-header">
                    <div className="usuario-avatar">
                      <MaterialIcon name="person" />
                    </div>
                    <div className="usuario-info">
                      <h4>{usuario.nome}</h4>
                      <p className="usuario-email">{usuario.email}</p>
                    </div>
                    <div className={`usuario-status ${usuario.ativo ? 'ativo' : 'inativo'}`}>
                      <MaterialIcon name={usuario.ativo ? 'check_circle' : 'cancel'} />
                      <span>{usuario.ativo ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>

                  <div className="usuario-details">
                    <div className="detail-item">
                      <MaterialIcon name="account_circle" />
                      <span>
                        <strong>Perfil:</strong> {getPerfilNome(usuario.perfil)}
                      </span>
                    </div>
                    
                    {usuario.curso && (
                      <div className="detail-item">
                        <MaterialIcon name="school" />
                        <span>
                          <strong>Curso:</strong> {usuario.curso}
                        </span>
                      </div>
                    )}
                    
                    <div className="detail-item">
                      <MaterialIcon name="schedule" />
                      <span>
                        <strong>Último login:</strong> {formatarDataUltimoLogin(usuario.ultimoLogin)}
                      </span>
                    </div>
                  </div>

                  <div className="usuario-actions">
                    {canEdit && (
                      <button
                        onClick={() => onEditar(usuario)}
                        className="btn btn-outline"
                        title="Editar usuário"
                      >
                        <MaterialIcon name="edit" />
                        Editar
                      </button>
                    )}
                    
                    {canDelete && user?.id !== usuario._id && (
                      <button
                        onClick={() => handleDelete(usuario)}
                        className={`btn ${usuario.ativo ? 'btn-danger' : 'btn-success'}`}
                        title={usuario.ativo ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        <MaterialIcon name={usuario.ativo ? 'person_remove' : 'person_add'} />
                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    )}
                    
                    {user?.id === usuario._id && (
                      <span className="own-user-indicator" style={{
                        color: '#666', 
                        fontSize: '0.875rem',
                        fontStyle: 'italic',
                        padding: '8px 12px'
                      }}>
                        <MaterialIcon name="account_circle" style={{fontSize: '16px', marginRight: '4px'}} />
                        Seu usuário
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação */}
      <ModalConfirmacao
        isOpen={modalConfirmacao.isOpen}
        onClose={cancelarAlteracaoStatus}
        onConfirm={confirmarAlteracaoStatus}
        titulo={modalConfirmacao.usuario?.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}
        mensagem={
          modalConfirmacao.usuario?.ativo
            ? `Tem certeza que deseja desativar o usuário ${modalConfirmacao.usuario?.nome}? Ele não conseguirá mais acessar o sistema.`
            : `Tem certeza que deseja ativar o usuário ${modalConfirmacao.usuario?.nome}? Ele terá acesso ao sistema novamente.`
        }
        tipo={modalConfirmacao.usuario?.ativo ? 'danger' : 'info'}
        textoBotaoConfirmar={modalConfirmacao.usuario?.ativo ? 'Desativar' : 'Ativar'}
        textoBotaoCancelar="Cancelar"
        carregando={modalConfirmacao.carregando}
      />
    </div>
  );
};

export default ListaUsuario;
