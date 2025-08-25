import { useState } from 'react';
import MaterialIcon from '../../components/MaterialIcon';
import FormularioCurso from '../../components/FormularioCurso';
import ListaCurso from '../../components/ListaCurso';
import FiltrosCurso from '../../components/FiltrosCurso';
import Modal from '../../components/Modal';
import { Curso } from '../../types';

const Cursos = () => {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cursoParaEditar, setCursoParaEditar] = useState<Curso | null>(null);
  const [atualizarLista, setAtualizarLista] = useState(false);
  const [filtros, setFiltros] = useState<{ 
    busca?: string;
    status?: string;
  }>({});

  const abrirNovo = () => { setCursoParaEditar(null); setMostrarForm(true); };
  const abrirEditar = (curso: Curso) => { setCursoParaEditar(curso); setMostrarForm(true); };
  const aoSalvar = () => { setMostrarForm(false); setCursoParaEditar(null); setAtualizarLista(a => !a); };

  return (
    <div className="cursos-page">
      <div className="container">
        <div className="page-header">
          <div className="page-title">
            <h1>
              <MaterialIcon name="school" />
              Gerenciamento de Cursos
            </h1>
            <p>Gerencie os cursos participantes do seminário</p>
          </div>
        </div>

        <div className="page-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div />
          <button className="btn btn-primary" onClick={abrirNovo}>
            <MaterialIcon name="add" /> Novo Curso
          </button>
        </div>

        <div className="page-content" style={{ display: 'grid', gap: 12 }}>
          <FiltrosCurso onChange={setFiltros} />
          <ListaCurso filtros={filtros} atualizarLista={atualizarLista} onEdit={abrirEditar} />
        </div>

        <Modal
          isOpen={mostrarForm}
          onClose={() => setMostrarForm(false)}
          title={cursoParaEditar ? 'Editar Curso' : 'Novo Curso'}
          size="medium"
        >
          <FormularioCurso
            cursoParaEditar={cursoParaEditar}
            onSalvo={aoSalvar}
            onCancelar={() => setMostrarForm(false)}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Cursos;
