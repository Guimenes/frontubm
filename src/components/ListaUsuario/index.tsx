import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Usuario, Perfil } from '../../types';
import { api } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface ListaUsuarioProps {
  filtros: {
    busca?: string;
    perfil?: string;
    status?: string;
    curso?: string;
  };
  onEditar: (usuario: Usuario) => void;
  atualizar: boolean;
  onAtualizarComplete: () => void;
}

const ListaUsuario = ({ filtros, onEditar, atualizar, onAtualizarComplete }: ListaUsuarioProps) => {
  const { hasPermission, user } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (filtros.curso) {
          const curso = filtros.curso.toLowerCase();
          usuariosFiltrados = usuariosFiltrados.filter((usuario: Usuario) =>
            usuario.curso?.toLowerCase().includes(curso)
          );
        }

        // Ordenar por nome
        usuariosFiltrados.sort((a: Usuario, b: Usuario) => a.nome.localeCompare(b.nome));

        setUsuarios(usuariosFiltrados);
      } else {
        setUsuarios([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      setError('Erro ao carregar usuários. Tente novamente.');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!canDelete) return;
    
    const action = usuario.ativo ? 'desativar' : 'ativar';
    const confirmMessage = `Tem certeza que deseja ${action} o usuário ${usuario.nome}?`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      const response = await api.delete(`/usuarios/${usuario._id}`);
      if (response.success) {
        alert(response.message || `Usuário ${action === 'desativar' ? 'desativado' : 'ativado'} com sucesso`);
        carregarUsuarios();
      }
    } catch (error: any) {
      console.error('Erro ao alterar status do usuário:', error);
      const message = error.response?.data?.message || `Erro ao ${action} usuário`;
      alert(message);
    }
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

  if (usuarios.length === 0) {
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
      <div className="lista-header">
        <h3>
          <MaterialIcon name="people" />
          {usuarios.length} usuário(s) encontrado(s)
        </h3>
      </div>

      <div className="usuarios-grid">
        {usuarios.map((usuario) => (
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
  );
};

export default ListaUsuario;
