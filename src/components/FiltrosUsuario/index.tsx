import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Perfil } from '../../types';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FiltrosUsuarioProps {
  onFiltroChange: (filtros: {
    busca?: string;
    perfil?: string;
    status?: string;
    curso?: string;
  }) => void;
}

const FiltrosUsuario = ({ onFiltroChange }: FiltrosUsuarioProps) => {
  const [busca, setBusca] = useState('');
  const [perfil, setPerfil] = useState('');
  const [status, setStatus] = useState('');
  const [curso, setCurso] = useState('');
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    carregarPerfis();
  }, []);

  // Remover onFiltroChange das dependências para evitar loop infinito
  useEffect(() => {
    const filtros = {
      busca: busca.trim() || undefined,
      perfil: perfil || undefined,
      status: status || undefined,
      curso: curso.trim() || undefined,
    };
    
    onFiltroChange(filtros);
  }, [busca, perfil, status, curso]); // Removido onFiltroChange das dependências

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

  const limparFiltros = () => {
    setBusca('');
    setPerfil('');
    setStatus('');
    setCurso('');
  };

  const temFiltrosAtivos = busca || perfil || status || curso;

  return (
    <div className="filtros-usuario">
      <div className="filtros-header">
        <h3>
          <MaterialIcon name="filter_list" />
          Filtros
        </h3>
        
        <div className="filtros-actions">
          {temFiltrosAtivos && (
            <button
              type="button"
              onClick={limparFiltros}
              className="btn-limpar"
              title="Limpar filtros"
            >
              <MaterialIcon name="clear_all" />
              Limpar
            </button>
          )}
          
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="btn-expandir"
            title={expanded ? 'Recolher filtros' : 'Expandir filtros'}
          >
            <MaterialIcon name={expanded ? 'expand_less' : 'expand_more'} />
          </button>
        </div>
      </div>

      <div className={`filtros-content ${expanded ? 'expanded' : ''}`}>
        <div className="filtros-grid">
          <div className="filtro-group">
            <label htmlFor="busca">
              <MaterialIcon name="search" />
              Buscar por nome ou email
            </label>
            <input
              type="text"
              id="busca"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome ou email..."
            />
          </div>

          <div className="filtro-group">
            <label htmlFor="perfil">
              <MaterialIcon name="account_circle" />
              Perfil
            </label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
            >
              <option value="">Todos os perfis</option>
              {perfis.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="status">
              <MaterialIcon name="toggle_on" />
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div className="filtro-group">
            <label htmlFor="curso">
              <MaterialIcon name="school" />
              Curso
            </label>
            <input
              type="text"
              id="curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              placeholder="Digite o curso..."
            />
          </div>
        </div>
      </div>

      {temFiltrosAtivos && (
        <div className="filtros-ativos">
          <span className="filtros-count">
            {[busca, perfil, status, curso].filter(Boolean).length} filtro(s) ativo(s)
          </span>
        </div>
      )}
    </div>
  );
};

export default FiltrosUsuario;
