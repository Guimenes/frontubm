import { useState } from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FiltrosLocalProps {
  onFiltroChange: (filtros: {
    busca?: string;
    tipo?: string;
    capacidadeMin?: number;
    capacidadeMax?: number;
  }) => void;
}

export default function FiltrosLocal({ onFiltroChange }: FiltrosLocalProps) {
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipo: '',
    capacidadeMin: '',
    capacidadeMax: ''
  });

  const tiposLocal = [
    { value: '', label: 'Todos os tipos' },
    { value: 'Sala de Aula', label: 'Sala de Aula' },
    { value: 'Biblioteca', label: 'Biblioteca' },
    { value: 'Laboratório', label: 'Laboratório' },
    { value: 'Auditório', label: 'Auditório' },
    { value: 'Anfiteatro', label: 'Anfiteatro' },
    { value: 'Pátio', label: 'Pátio' },
    { value: 'Quadra', label: 'Quadra' },
    { value: 'Espaço', label: 'Espaço' }
  ];

  const handleFiltroChange = (campo: string, valor: string) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);

    // Converter valores vazios para undefined e números
    const filtrosProcessados = {
      busca: novosFiltros.busca || undefined,
      tipo: novosFiltros.tipo || undefined,
      capacidadeMin: novosFiltros.capacidadeMin ? parseInt(novosFiltros.capacidadeMin) : undefined,
      capacidadeMax: novosFiltros.capacidadeMax ? parseInt(novosFiltros.capacidadeMax) : undefined
    };

    onFiltroChange(filtrosProcessados);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      tipo: '',
      capacidadeMin: '',
      capacidadeMax: ''
    };
    setFiltros(filtrosLimpos);
    onFiltroChange({});
  };

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtros.busca) ativos.push({ label: `Busca: "${filtros.busca}"`, campo: 'busca' });
    if (filtros.tipo) ativos.push({ label: `Tipo: ${filtros.tipo}`, campo: 'tipo' });
    if (filtros.capacidadeMin) ativos.push({ label: `Min: ${filtros.capacidadeMin} pessoas`, campo: 'capacidadeMin' });
    if (filtros.capacidadeMax) ativos.push({ label: `Max: ${filtros.capacidadeMax} pessoas`, campo: 'capacidadeMax' });
    return ativos;
  };

  const removerFiltro = (campo: string) => {
    handleFiltroChange(campo, '');
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <div className="filtros-local">
      <div className="filtros-header">
        <div className="filtro-busca">
          <div className="input-with-icon">
            <MaterialIcon name="search" />
            <input
              type="text"
              placeholder="Buscar locais por código ou nome..."
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
              <label>Tipo de Local</label>
              <select
                value={filtros.tipo}
                onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              >
                {tiposLocal.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Capacidade Mínima</label>
              <input
                type="number"
                placeholder="Ex: 20"
                value={filtros.capacidadeMin}
                onChange={(e) => handleFiltroChange('capacidadeMin', e.target.value)}
                min="1"
              />
            </div>

            <div className="filtro-group">
              <label>Capacidade Máxima</label>
              <input
                type="number"
                placeholder="Ex: 100"
                value={filtros.capacidadeMax}
                onChange={(e) => handleFiltroChange('capacidadeMax', e.target.value)}
                min="1"
              />
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
