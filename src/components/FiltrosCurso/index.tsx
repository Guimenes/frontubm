import { useState } from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FiltrosCursoProps {
  onChange?: (filtros: {
    busca?: string;
  }) => void;
}

export default function FiltrosCurso({ onChange }: FiltrosCursoProps) {
  const [filtros, setFiltros] = useState({
    busca: ''
  });

  const handleFiltroChange = (campo: string, valor: string) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);

    // Converter valores vazios para undefined
    const filtrosProcessados = {
      busca: novosFiltros.busca || undefined
    };

    onChange?.(filtrosProcessados);
  };

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtros.busca) ativos.push({ label: `Busca: "${filtros.busca}"`, campo: 'busca' });
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
      </div>

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
