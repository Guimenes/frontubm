import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Perfil } from '../../types';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FiltrosUsuarioProps {
  onChange?: (filtros: {
    busca?: string;
    perfil?: string;
    status?: string;
  }) => void;
}

export default function FiltrosUsuario({ onChange }: FiltrosUsuarioProps) {
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    perfil: '',
    status: ''
  });
  const [perfis, setPerfis] = useState<Perfil[]>([]);

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'inativo', label: 'Inativo' }
  ];

  useEffect(() => {
    carregarPerfis();
  }, []);

  const carregarPerfis = async () => {
    try {
      const response = await api.get('/perfis');
      if (response.success && response.data && Array.isArray(response.data)) {
        setPerfis(response.data.filter((p: Perfil) => p.ativo));
      }
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  };

  const handleFiltroChange = (campo: string, valor: string) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);

    // Converter valores vazios para undefined
    const filtrosProcessados = {
      busca: novosFiltros.busca || undefined,
      perfil: novosFiltros.perfil || undefined,
      status: novosFiltros.status || undefined
    };

    onChange?.(filtrosProcessados);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      perfil: '',
      status: ''
    };
    setFiltros(filtrosLimpos);
    onChange?.({});
  };

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtros.busca) ativos.push({ label: `Busca: "${filtros.busca}"`, campo: 'busca' });
    if (filtros.perfil) {
      const perfilSelecionado = perfis.find(p => p._id === filtros.perfil);
      ativos.push({ label: `Perfil: ${perfilSelecionado?.nome || 'Desconhecido'}`, campo: 'perfil' });
    }
    if (filtros.status) {
      const statusSelecionado = statusOptions.find(s => s.value === filtros.status);
      ativos.push({ label: `Status: ${statusSelecionado?.label || 'Desconhecido'}`, campo: 'status' });
    }
    return ativos;
  };

  const removerFiltro = (campo: string) => {
    handleFiltroChange(campo, '');
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <div className="filtros-usuario">
      <div className="filtros-header">
        <div className="filtro-busca">
          <div className="input-with-icon">
            <MaterialIcon name="search" />
            <input
              type="text"
              placeholder="Buscar usuários por nome ou email..."
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
              <label>Perfil do Usuário</label>
              <select
                value={filtros.perfil}
                onChange={(e) => handleFiltroChange('perfil', e.target.value)}
              >
                <option value="">Todos os perfis</option>
                {perfis.map(perfil => (
                  <option key={perfil._id} value={perfil._id}>
                    {perfil.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Status do Usuário</label>
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
