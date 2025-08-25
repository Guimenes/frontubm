import { useState, useEffect } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import FormularioEvento from '../../components/FormularioEvento';
import ListaEvento from '../../components/ListaEvento';
import FiltrosEvento from '../../components/FiltrosEvento';
import Modal from '../../components/Modal';
import { Evento } from '../../types';
import './styles.css';

const Eventos = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<Evento | null>(null);
  const [filtros, setFiltros] = useState<{
    busca?: string;
    tipoEvento?: string;
    data?: string;
    local?: string;
    curso?: string;
    groupByCurso?: boolean;
  }>({ groupByCurso: true }); // Inicializar com divisão por curso ativa
  const [atualizarLista, setAtualizarLista] = useState(0);

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

  const handleNovoEvento = () => {
    setEventoParaEditar(null);
    setMostrarFormulario(true);
  };

  const handleEditarEvento = (evento: Evento) => {
    setEventoParaEditar(evento);
    setMostrarFormulario(true);
  };

  const handleEventoSalvo = () => {
    setMostrarFormulario(false);
    setEventoParaEditar(null);
    // Força a atualização da lista incrementando o contador
    setAtualizarLista(prev => prev + 1);
  };

  const handleCancelarFormulario = () => {
    setMostrarFormulario(false);
    setEventoParaEditar(null);
  };

  const handleAtualizarComplete = () => {
    // Função chamada quando a lista precisar ser atualizada
  };

  const handleFiltroChange = (novosFiltros: {
    busca?: string;
    tipoEvento?: string;
    data?: string;
    local?: string;
    curso?: string;
    groupByCurso?: boolean;
  }) => {
    console.log('Eventos: Recebendo novos filtros:', novosFiltros);
    setFiltros(novosFiltros);
  };

  return (
    <div className="eventos-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <MaterialIcon name="event" />
              Gerenciamento de Eventos
            </h1>
            <p>Gerencie os eventos do seminário</p>
          </div>
        </div>

        <div className="page-content">
          <div className="page-actions">
            <button onClick={handleNovoEvento} className="btn btn-primary">
              <MaterialIcon name="add" />
              Novo Evento
            </button>
          </div>

          <FiltrosEvento onFiltrar={handleFiltroChange} />
          
          <ListaEvento
            filtros={filtros}
            onEditar={handleEditarEvento}
            onAtualizar={handleAtualizarComplete}
            atualizarLista={atualizarLista}
          />
        </div>
      </div>

      {/* Modal para formulário */}
      <Modal
        isOpen={mostrarFormulario}
        onClose={handleCancelarFormulario}
        title={eventoParaEditar ? 'Editar Evento' : 'Novo Evento'}
        size="large"
      >
        <FormularioEvento
          evento={eventoParaEditar || undefined}
          onSalvar={handleEventoSalvo}
          onCancelar={handleCancelarFormulario}
        />
      </Modal>
    </div>
  );
};

export default Eventos;
