import React, { useState, useEffect } from 'react';
import MaterialIcon from '../MaterialIcon';
import { cursoService, localService } from '../../services/api';
import { Curso } from '../../types';
import './styles.css';

interface FiltrosEventoProps {
  onFiltrar: (filtros: {
    busca?: string;
    tipoEvento?: string;
    data?: string;
    local?: string;
    curso?: string;
    groupByCurso?: boolean;
  }) => void;
}

const FiltrosEvento: React.FC<FiltrosEventoProps> = ({ onFiltrar }) => {
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    busca: '',
    tipoEvento: '',
    data: '',
    local: '',
    curso: ''
  });
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [locaisComEventos, setLocaisComEventos] = useState<string[]>([]);

  const tiposEvento = [
    { value: '', label: 'Todos os tipos' },
    { value: 'Palestra Principal', label: 'Palestra Principal' },
    { value: 'Apresentação de Trabalhos', label: 'Apresentação de Trabalhos' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Banner', label: 'Banner' }
  ];

  // Carregar cursos para o filtro
  useEffect(() => {
    const carregarDados = async () => {
      try {
        console.log('=== Iniciando carregamento de dados ===');
        
        // Carregar cursos
        const responseCursos = await cursoService.listarCursos({ limit: 100 });
        console.log('Response cursos:', responseCursos);
        if (responseCursos.success && responseCursos.data) {
          setCursos(responseCursos.data);
        }

        // Carregar locais com eventos
        console.log('Fazendo requisição para locais com eventos...');
        const responseLocais = await localService.listarLocaisComEventos();
        console.log('Response locais com eventos:', responseLocais);
        if (responseLocais.success && responseLocais.data) {
          console.log('Locais carregados:', responseLocais.data);
          setLocaisComEventos(responseLocais.data);
        } else {
          console.error('Erro ao carregar locais:', responseLocais.message);
        }
        
        console.log('=== Finalizado carregamento de dados ===');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  // Enviar filtros iniciais com groupByCurso ativo apenas uma vez
  useEffect(() => {
    console.log('FiltrosEvento: Enviando filtros iniciais com groupByCurso: true');
    onFiltrar({ groupByCurso: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio - executa apenas uma vez

  const handleFiltroChange = (campo: string, valor: string) => {
    const novosFiltros = {
      ...filtros,
      [campo]: valor
    };
    setFiltros(novosFiltros);

    // Converter valores vazios para undefined
    const filtrosProcessados = {
      busca: novosFiltros.busca || undefined,
      tipoEvento: novosFiltros.tipoEvento || undefined,
      data: novosFiltros.data || undefined,
      local: novosFiltros.local || undefined,
      curso: novosFiltros.curso || undefined,
      groupByCurso: true // Sempre dividir por curso agora
    };

    console.log('FiltrosEvento: Enviando filtros processados:', filtrosProcessados);
    onFiltrar(filtrosProcessados);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      busca: '',
      tipoEvento: '',
      data: '',
      local: '',
      curso: ''
    };
    setFiltros(filtrosLimpos);
    onFiltrar({ groupByCurso: true }); // Sempre dividir por curso agora
  };

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtros.busca) ativos.push({ label: `Busca: "${filtros.busca}"`, campo: 'busca' });
    if (filtros.tipoEvento) ativos.push({ label: `Tipo: ${filtros.tipoEvento}`, campo: 'tipoEvento' });
    if (filtros.data) ativos.push({ label: `Data: ${new Date(filtros.data).toLocaleDateString('pt-BR')}`, campo: 'data' });
    if (filtros.local) ativos.push({ label: `Local: ${filtros.local}`, campo: 'local' });
    if (filtros.curso) {
      const cursoSelecionado = cursos.find(c => c._id === filtros.curso);
      ativos.push({ label: `Curso: ${cursoSelecionado?.nome || filtros.curso}`, campo: 'curso' });
    }
    return ativos;
  };

  const removerFiltro = (campo: string) => {
    handleFiltroChange(campo, '');
  };

  const filtrosAtivos = getFiltrosAtivos();

  return (
    <div className="filtros-evento">
      <div className="filtros-header">
        <div className="filtro-busca">
          <div className="input-with-icon">
            <MaterialIcon name="search" />
            <input
              type="text"
              placeholder="Buscar eventos por código, tema, autores ou palestrante..."
              value={filtros.busca}
              onChange={(e) => handleFiltroChange('busca', e.target.value)}
              className="busca-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
      </div>

      {filtrosExpanded && (
        <div className="filtros-expandidos">
          <div className="filtros-row">
            <div className="filtro-group">
              <label>Tipo de Evento</label>
              <select
                value={filtros.tipoEvento}
                onChange={(e) => handleFiltroChange('tipoEvento', e.target.value)}
              >
                {tiposEvento.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-group">
              <label>Data do Evento</label>
              <input
                type="date"
                value={filtros.data}
                onChange={(e) => handleFiltroChange('data', e.target.value)}
              />
            </div>

            <div className="filtro-group">
              <label>Local</label>
              <select
                value={filtros.local}
                onChange={(e) => handleFiltroChange('local', e.target.value)}
              >
                <option value="">Todos os locais</option>
                {locaisComEventos.length > 0 ? (
                  locaisComEventos.map((local, index) => (
                    <option key={index} value={local}>
                      {local}
                    </option>
                  ))
                ) : (
                  <option disabled>Nenhum local com eventos encontrado</option>
                )}
              </select>
            </div>

            <div className="filtro-group">
              <label>Curso</label>
              <select
                value={filtros.curso}
                onChange={(e) => handleFiltroChange('curso', e.target.value)}
              >
                <option value="">Todos os cursos</option>
                {cursos.map(curso => (
                  <option key={curso._id} value={curso._id}>
                    {curso.nome} ({curso.cod})
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
};

export default FiltrosEvento;
