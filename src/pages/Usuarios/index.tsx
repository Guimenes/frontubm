import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Usuario } from '../../types';
import MaterialIcon from '../../components/MaterialIcon';
import FormularioUsuario from '../../components/FormularioUsuario';
import ListaUsuario from '../../components/ListaUsuario';
import FiltrosUsuario from '../../components/FiltrosUsuario';
import Modal from '../../components/Modal';
import ContainerNotificacoes from '../../components/ContainerNotificacoes';
import { useNotificacao } from '../../hooks/useNotificacao';
import '../../components/Modal/ModalUsuarios.css';
import './styles.css';

const Usuarios = () => {
  const { hasPermission } = useAuth();
  const { notificacoes, adicionarNotificacao, removerNotificacao } = useNotificacao();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Usuario | null>(null);
  const [atualizarLista, setAtualizarLista] = useState(false);
  const [filtrosState, setFiltrosState] = useState({});

  // Memoizar os filtros para evitar re-renders desnecessários
  const filtros = useMemo(() => filtrosState, [filtrosState]);

  // Verificar permissões
  const canList = hasPermission('USUARIOS_LISTAR');
  const canCreate = hasPermission('USUARIOS_CRIAR');

  // Bloqueia scroll do body quando modal está aberto
  useEffect(() => {
    if (mostrarFormulario) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [mostrarFormulario]);

  const handleNovoUsuario = () => {
    setUsuarioParaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioParaEditar(usuario);
    setMostrarFormulario(true);
  };

  const handleUsuarioSalvo = () => {
    setMostrarFormulario(false);
    setUsuarioParaEditar(null);
    setAtualizarLista(true);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setUsuarioParaEditar(null);
  };

  const handleSucesso = (titulo: string, mensagem?: string) => {
    adicionarNotificacao({
      titulo,
      mensagem,
      tipo: 'sucesso',
      duracao: 5000
    });
  };

  const handleErro = (titulo: string, mensagem?: string) => {
    adicionarNotificacao({
      titulo,
      mensagem,
      tipo: 'erro',
      duracao: 7000
    });
  };

  const handleAtualizarComplete = () => {
    setAtualizarLista(false);
  };

  const handleFiltroChange = useCallback((novosFiltros: any) => {
    setFiltrosState(novosFiltros);
  }, []);

  if (!canList) {
    return (
      <div className="usuarios-page">
        <div className="container">
          <div className="access-denied">
            <MaterialIcon name="block" />
            <h2>Acesso Negado</h2>
            <p>Você não tem permissão para visualizar usuários.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <MaterialIcon name="people" />
              Gerenciamento de Usuários
            </h1>
            <p>Gerencie os usuários do sistema e suas permissões</p>
          </div>
        </div>

        <div className="page-content">
          <div className="page-actions">
            {canCreate && (
              <button onClick={handleNovoUsuario} className="btn btn-primary">
                <MaterialIcon name="person_add" />
                Novo Usuário
              </button>
            )}
          </div>

          <FiltrosUsuario onFiltroChange={handleFiltroChange} />
          
          <ListaUsuario
            filtros={filtros}
            onEditar={handleEditarUsuario}
            atualizar={atualizarLista}
            onAtualizarComplete={handleAtualizarComplete}
          />
        </div>
      </div>

      {/* Modal para formulário */}
      <Modal
        isOpen={mostrarFormulario}
        onClose={handleCancelarFormulario}
        title={usuarioParaEditar ? 'Editar Usuário' : 'Novo Usuário'}
        size="large"
        className="modal-usuarios"
      >
        <FormularioUsuario
          usuarioParaEditar={usuarioParaEditar}
          onSalvar={handleUsuarioSalvo}
          onCancelar={handleCancelarFormulario}
          onSucesso={handleSucesso}
          onErro={handleErro}
        />
      </Modal>

      {/* Container de Notificações */}
      <ContainerNotificacoes 
        notificacoes={notificacoes}
        onRemover={removerNotificacao}
      />
    </div>
  );
};

export default Usuarios;
