import React, { useState, useEffect } from 'react';
import { Evento } from '../../types';
import { eventoService } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import Modal from '../Modal';
import './styles.css';

interface ListaEventoProps {
  onEditar: (evento: Evento) => void;
  onAtualizar: () => void;
  atualizarLista?: number;
  filtros?: {
    busca?: string;
    tipoEvento?: string;
    data?: string;
    local?: string;
    curso?: string;
  groupByCurso?: boolean;
  };
}

const ListaEvento: React.FC<ListaEventoProps> = ({ onEditar, onAtualizar, atualizarLista, filtros }) => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<Evento | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [isLoadingEventos, setIsLoadingEventos] = useState(false); // Controle para evitar múltiplas requisições
  const [paginacao, setPaginacao] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    // Carregar eventos com um pequeno delay para evitar requisições excessivas
    const timeoutId = setTimeout(() => {
      carregarEventos();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [atualizarLista]);

  useEffect(() => {
    // Reset página e recarregar quando filtros mudarem
    const timeoutId = setTimeout(() => {
      setPaginacao(prev => ({ ...prev, currentPage: 1 }));
      carregarEventos();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [filtros?.busca, filtros?.tipoEvento, filtros?.data, filtros?.local, filtros?.curso, filtros?.groupByCurso]);

  useEffect(() => {
    // Carregar eventos quando página mudar (mas não na primeira vez)
    if (paginacao.currentPage > 1) {
      carregarEventos();
    }
  }, [paginacao.currentPage]);

  const carregarEventos = async () => {
    // Evitar múltiplas requisições simultâneas
    if (isLoadingEventos) {
      return;
    }
    
    setLoading(true);
    setIsLoadingEventos(true);
    
    try {
      const paginaAtual = paginacao.currentPage;
      const response = await eventoService.listarEventos({
        page: paginaAtual,
        limit: filtros?.groupByCurso ? 100 : paginacao.itemsPerPage,
        search: filtros?.busca,
        tipoEvento: filtros?.tipoEvento,
        data: filtros?.data,
        local: filtros?.local,
        curso: filtros?.curso
      });

      if (response.success && response.data) {
        // Filtro por curso no cliente (fallback caso o backend não aplique corretamente)
        let lista = response.data as Evento[];
        if (filtros?.curso) {
          lista = lista.filter((ev: any) => {
            const cursosEvento: any[] = Array.isArray(ev.cursos)
              ? ev.cursos
              : (ev.curso ? [ev.curso] : []);
            // Caso no futuro exista filtro "GERAL" para eventos sem curso
            if (filtros.curso === 'GERAL') return cursosEvento.length === 0;
            return cursosEvento.some((c: any) => (typeof c === 'object' ? c._id : c) === filtros.curso);
          });
        }

        setEventos(lista);
        if (response.pagination && !filtros?.groupByCurso) {
          // Quando não agrupado por curso, respeitar paginação do backend
          setPaginacao(prev => ({
            ...prev,
            totalPages: response.pagination!.totalPages,
            totalItems: response.pagination!.totalItems
          }));
        } else {
          // Quando agrupado por curso (ou sem paginação do backend), ajustar contadores pela lista filtrada
          setPaginacao(prev => ({
            ...prev,
            totalPages: 1,
            totalItems: lista.length
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
      setIsLoadingEventos(false);
    }
  };

  const handleDelete = async (id: string) => {
    setExcluindo(true);
    try {
      const response = await eventoService.deletarEvento(id);
      if (response.success) {
        setEventoParaExcluir(null);
        carregarEventos();
        onAtualizar();
      } else {
        alert(response.message || 'Erro ao excluir evento');
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      alert('Erro de conexão com o servidor');
    } finally {
      setExcluindo(false);
    }
  };

  const abrirModalExclusao = (evento: Evento) => {
    setEventoParaExcluir(evento);
  };

  const fecharModalExclusao = () => {
    setEventoParaExcluir(null);
  };

  const formatarData = (data: Date) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora: Date) => {
    const h = new Date(hora);
    return h.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoEventoIcon = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'Palestra Principal':
        return 'campaign';
      case 'Apresentação de Trabalhos':
        return 'assignment';
      case 'Oficina':
        return 'build';
      case 'Banner':
        return 'flag';
      default:
        return 'event';
    }
  };

  const getTipoEventoClass = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'Palestra Principal':
        return 'palestra-principal';
      case 'Apresentação de Trabalhos':
        return 'apresentacao-trabalhos';
      case 'Oficina':
        return 'oficina';
      case 'Banner':
        return 'banner';
      default:
        return '';
    }
  };

  const getTipoEventoTexto = (tipoEvento: string) => {
    switch (tipoEvento) {
      case 'Apresentação de Trabalhos':
        return 'Apresentação de Trabalhos';
      case 'Palestra Principal':
        return 'Palestra';
      default:
        return tipoEvento;
    }
  };

  if (loading) {
    return (
      <div className="lista-loading">
        <MaterialIcon name="hourglass_empty" size="large" />
        <p>Carregando eventos...</p>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="lista-empty">
        <MaterialIcon name="event_busy" size="large" />
        <h3>Nenhum evento encontrado</h3>
        <p>Não há eventos cadastrados com os filtros aplicados.</p>
      </div>
    );
  }

  const renderEventoCard = (evento: Evento) => (
    <div key={evento._id} className="evento-card">
      <div className="evento-header">
        <div className="evento-codigo">
          <MaterialIcon name="tag" size="small" />
          {evento.cod}
        </div>
        <div className={`evento-tipo ${getTipoEventoClass(evento.tipoEvento)}`}>
          <MaterialIcon name={getTipoEventoIcon(evento.tipoEvento)} size="small" />
          {getTipoEventoTexto(evento.tipoEvento)}
        </div>
      </div>

      <div className="evento-content">
        <h4 className="evento-tema">{evento.tema}</h4>

          <div className="evento-info">
            {evento.tipoEvento === 'Palestra Principal' ? (
              <div className="info-item">
                <MaterialIcon name="person" size="small" />
                <span>
                  <strong>Palestrante:</strong> {evento.palestrante}
                </span>
              </div>
            ) : evento.tipoEvento === 'Banner' ? (
              <div className="info-item">
                <MaterialIcon name="info" size="small" />
                <span style={{ fontStyle: 'italic', color: '#666' }}>
                  Evento do tipo Banner
                </span>
              </div>
            ) : (
              <>
                {evento.autores && evento.autores.length > 0 && (
                  <div className="info-item">
                    <MaterialIcon name="group" size="small" />
                    <span>
                      <strong>Autores:</strong> {evento.autores?.join(', ')}
                    </span>
                  </div>
                )}

                {evento.orientador && (
                  <div className="info-item">
                    <MaterialIcon name="school" size="small" />
                    <span>
                      <strong>Orientador:</strong> {evento.orientador}
                    </span>
                  </div>
                )}
              </>
            )}

            {(Array.isArray((evento as any).cursos) && (evento as any).cursos.length > 0) || evento.curso ? (
              <div className="info-item">
                <MaterialIcon name="school" size="small" />
                <span>
                  <strong>{Array.isArray((evento as any).cursos) ? 'Cursos' : 'Curso'}:</strong> {
                    Array.isArray((evento as any).cursos)
                      ? (evento as any).cursos.map((c: any) => typeof c === 'object' ? `${c.nome} (${c.cod})` : c).join(', ')
                      : (typeof evento.curso === 'object' ? `${(evento.curso as any).nome} (${(evento.curso as any).cod})` : (evento.curso as any))
                  }
                </span>
              </div>
            ) : (
              <div className="info-item">
                <MaterialIcon name="public" size="small" />
                <span>
                  <strong>Curso:</strong> <em style={{color: 'var(--text-light)'}}>Evento Geral</em>
                </span>
              </div>
            )}

            {evento.data && (
              <div className="info-item">
                <MaterialIcon name="calendar_today" size="small" />
                <span>
                  <strong>Data:</strong> {formatarData(evento.data)}
                </span>
              </div>
            )}

            {evento.hora && (
              <div className="info-item">
                <MaterialIcon name="schedule" size="small" />
                <span>
                  <strong>Hora:</strong> {formatarHora(evento.hora)}
                </span>
              </div>
            )}

            {evento.sala && (
              <div className="info-item">
                <MaterialIcon name="place" size="small" />
                <span>
                  <strong>Sala:</strong> {evento.sala}
                </span>
              </div>
            )}
          </div>

        {evento.resumo && (
          <div className="evento-resumo">
            <p>{evento.resumo}</p>
          </div>
        )}
      </div>

      <div className="evento-actions">
        <button
          onClick={() => onEditar(evento)}
          className="btn-action btn-edit"
          title="Editar evento"
        >
          <MaterialIcon name="edit" />
        </button>
        <button
          onClick={() => abrirModalExclusao(evento)}
          className="btn-action btn-delete"
          title="Excluir evento"
        >
          <MaterialIcon name="delete" />
        </button>
      </div>
    </div>
  );

  // Peso heurístico para ordenar por "tamanho" do card (maiores primeiro)
  const getCardWeight = (ev: Evento) => {
    const resumoLen = ev.resumo ? ev.resumo.length : 0;
    const autoresCount = Array.isArray(ev.autores) ? ev.autores.length : 0;
    const temaLen = ev.tema ? ev.tema.length : 0;
    const extras = (ev.palestrante ? 1 : 0) + (ev.orientador ? 1 : 0);
    // Dar maior peso a autores e resumo, que expandem visivelmente o card
    return autoresCount * 300 + resumoLen * 2 + temaLen + extras * 80;
  };

  // Agrupamento por curso quando solicitado
  let eventosPorCurso: Record<string, Evento[]> | null = null;
  if (filtros?.groupByCurso && eventos.length > 0) {
    // Se o filtro de curso estiver ativo, consolidar em um único grupo do curso selecionado
    if (filtros?.curso) {
      // Tentar descobrir o nome do curso selecionado a partir dos próprios eventos
      let nomeCursoSelecionado: string = 'Curso';
      for (const ev of eventos as any[]) {
        const cursosDoEvento = Array.isArray(ev.cursos) ? ev.cursos : (ev.curso ? [ev.curso] : []);
        const match = cursosDoEvento.find((c: any) => (typeof c === 'object' ? c._id : c) === filtros.curso);
        if (match) {
          nomeCursoSelecionado = typeof match === 'object' && match?.nome ? match.nome : nomeCursoSelecionado;
          break;
        }
      }
      // Ordenar dentro do grupo também
      const ordenados = [...eventos].sort((a, b) => getCardWeight(b) - getCardWeight(a));
      eventosPorCurso = { [nomeCursoSelecionado]: ordenados };
    } else {
      eventosPorCurso = eventos.reduce((acc: Record<string, Evento[]>, ev) => {
      // Verifica se o evento tem cursos[] ou curso legado
      const cursosDoEvento = Array.isArray((ev as any).cursos) && (ev as any).cursos.length > 0 
        ? (ev as any).cursos 
        : (ev.curso ? [ev.curso] : []);
      
      if (cursosDoEvento.length === 0) {
        // É um evento geral
        if (!acc['GERAIS']) acc['GERAIS'] = [];
        acc['GERAIS'].push(ev);
      } else {
        // Adiciona o evento em cada curso a que pertence
        cursosDoEvento.forEach((c: any) => {
          const chave = typeof c === 'object' ? `${c.nome}` : c ? String(c) : 'GERAIS';
          if (!acc[chave]) acc[chave] = [];
          if (!acc[chave].includes(ev)) acc[chave].push(ev);
        });
      }
      return acc;
      }, {});
      // Ordenar cada grupo por tamanho do card
      Object.keys(eventosPorCurso).forEach(k => {
        eventosPorCurso![k] = eventosPorCurso![k].slice().sort((a, b) => getCardWeight(b) - getCardWeight(a));
      });
    }
  }

  return (
    <div className="lista-eventos">
      <div className="lista-header">
        <h3>
          <MaterialIcon name="list" />
          Eventos Cadastrados
        </h3>
        <span className="total-items">
          {paginacao.totalItems} {paginacao.totalItems === 1 ? 'evento' : 'eventos'}
        </span>
      </div>
      {filtros?.groupByCurso && eventosPorCurso ? (
        Object.entries(eventosPorCurso).map(([curso, lista]) => (
          <div key={curso} style={{ marginBottom: 32 }}>
            <div className="lista-header" style={{ marginTop: 8 }}>
              <h3 style={{ fontSize: '1.1rem' }}>
                <MaterialIcon name={curso === 'GERAIS' ? 'public' : 'school'} />
                {curso === 'GERAIS' ? 'Eventos Gerais' : curso}
              </h3>
              <span className="total-items">{lista.length}</span>
            </div>
            <div className="eventos-grid">
              {lista.map(ev => renderEventoCard(ev))}
            </div>
          </div>
        ))
      ) : (
        <div className="eventos-grid">
          {[...eventos]
            .sort((a, b) => getCardWeight(b) - getCardWeight(a))
            .map((evento) => renderEventoCard(evento))}
        </div>
      )}

      {/* Paginação - apenas quando não agrupado por curso */}
      {!filtros?.groupByCurso && paginacao.totalPages > 1 && (
        <div className="paginacao">
          <button
            onClick={() => setPaginacao(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={paginacao.currentPage === 1}
            className="btn btn-secondary"
          >
            <MaterialIcon name="chevron_left" size="small" />
            Anterior
          </button>
          
          <span className="pagination-info">
            Página {paginacao.currentPage} de {paginacao.totalPages}
          </span>
          
          <button
            onClick={() => setPaginacao(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={paginacao.currentPage === paginacao.totalPages}
            className="btn btn-secondary"
          >
            Próxima
            <MaterialIcon name="chevron_right" size="small" />
          </button>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={!!eventoParaExcluir}
        onClose={fecharModalExclusao}
        title="Confirmar Exclusão"
        size="small"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '20px', textAlign: 'center' }}>
            Deseja realmente excluir o evento <strong>{eventoParaExcluir?.tema}</strong>?
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              className="btn btn-secondary" 
              onClick={fecharModalExclusao}
              disabled={excluindo}
            >
              <MaterialIcon name="close" /> Cancelar
            </button>
            <button 
              className="btn btn-danger" 
              onClick={() => eventoParaExcluir?._id && handleDelete(eventoParaExcluir._id)}
              disabled={excluindo}
            >
              <MaterialIcon name="delete" /> {excluindo ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ListaEvento;
