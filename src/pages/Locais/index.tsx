import { useState, useEffect } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import FormularioLocal from '../../components/FormularioLocal';
import ListaLocal from '../../components/ListaLocal';
import FiltrosLocal from '../../components/FiltrosLocal';
import Modal from '../../components/Modal';
import { Local } from '../../types';
import './styles.css';

const Locais = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [localParaEditar, setLocalParaEditar] = useState<Local | null>(null);
  const [atualizarLista, setAtualizarLista] = useState(false);
  const [filtros, setFiltros] = useState({});

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

  const handleNovoLocal = () => {
    setLocalParaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarLocal = (local: Local) => {
    setLocalParaEditar(local);
    setMostrarFormulario(true);
  };

  const handleLocalSalvo = () => {
    setMostrarFormulario(false);
    setLocalParaEditar(null);
    setAtualizarLista(true);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setLocalParaEditar(null);
  };

  const handleAtualizarComplete = () => {
    setAtualizarLista(false);
  };

  const handleFiltroChange = (novosFiltros: any) => {
    setFiltros(novosFiltros);
  };

  return (
    <div className="locais-page">
      <div className="page-header">
        <div className="container">
          <div className="page-title">
            <h1>
              <MaterialIcon name="location_on" />
              Gerenciamento de Locais
            </h1>
            <p>Gerencie os espaços e locais do seminário</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="page-content">
          <div className="page-actions">
            <button onClick={handleNovoLocal} className="btn btn-primary">
              <MaterialIcon name="add" />
              Novo Local
            </button>
          </div>

          <FiltrosLocal onFiltroChange={handleFiltroChange} />
          
          <ListaLocal
            filtros={filtros}
            onEditar={handleEditarLocal}
            atualizar={atualizarLista}
            onAtualizarComplete={handleAtualizarComplete}
          />
        </div>
      </div>

      {/* Modal para formulário */}
      <Modal
        isOpen={mostrarFormulario}
        onClose={handleCancelarFormulario}
        title={localParaEditar ? 'Editar Local' : 'Novo Local'}
        size="medium"
        className="modal-locais"
      >
        <FormularioLocal
          localParaEditar={localParaEditar}
          onSalvar={handleLocalSalvo}
          onCancelar={handleCancelarFormulario}
        />
      </Modal>
    </div>
  );
};

export default Locais;
