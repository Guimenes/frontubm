import { useState } from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FiltrosCursoProps {
  onChange?: (filtros: {
    busca?: string;
    status?: string;
  }) => void;
}

export default function FiltrosCurso({ onChange }: FiltrosCursoProps) {
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: ''
  });

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Inativo', label: 'Inativo' },
    { value: 'Em planejamento', label: 'Em planejamento' }
  ];

  const handleFiltroChange = (campo: string, valor: string) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);

    // Converter valores vazios para undefined
    const filtrosProcessados = {
      busca: novosFiltros.busca || undefined,
      status: novosFiltros.status || undefined
    };

    onChange?.(filtrosProcessados);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      status: ''
    };
    setFiltros(filtrosLimpos);
    onChange?.({});
  };

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtros.busca) ativos.push({ label: `Busca: "${filtros.busca}"`, campo: 'busca' });
    if (filtros.status) ativos.push({ label: `Status: ${filtros.status}`, campo: 'status' });
    return ativos;
  };

  const removerFiltro = (campo: string) => {
    handleFiltroChange(campo, '');
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <div className="filtros-curso">
      <div className="filtros-header">
        <div className="filtro-busca">
          <div className="input-with-icon">
            <MaterialIcon name="search" />
            <input
              type="text"
              placeholder="Buscar cursos por código ou nome..."
              value={filtros.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              className="busca-input"
            />
          </div>
        </div>

        <button
          onClick={() => setFiltrosExpanded(!filtrosExpanded)}
          className={`btn-expandir-filtros ${filtrosExpanded ? 'expanded' : ''}`}
        >
          <MaterialIcon name="tune" />
          Filtros
          <MaterialIcon name={filtrosExpanded ? 'expand_less' : 'expand_more'} />
          {filtrosAtivos.length > 0 && (
            <span className="filtros-contador">{filtrosAtivos.length}</span>
          )}
        </button>
      </div>

      {filtrosExpanded && (
        <div className="filtros-expandidos">
          <div className="filtros-row">
            <div className="filtro-group">
              <label>Status do Curso</label>
              <select
                value={filtros.status}
                onChange={(e) => handleFiltroChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filtros-actions">
            <button onClick={limparFiltros} className="btn-limpar">
              <MaterialIcon name="clear_all" />
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {filtrosAtivos.length > 0 && (
        <div className="filtros-ativos">
          <span className="filtros-ativos-label">Filtros ativos:</span>
          <div className="filtros-tags">
            {filtrosAtivos.map((filtro, index) => (
              <div key={index} className="filtro-tag">
                <span>{filtro.label}</span>
                <button
                  onClick={() => removerFiltro(filtro.campo)}
                  className="remover-filtro"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
