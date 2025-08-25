import { useState, useEffect } from 'react';
import { localService } from '../../services/api';
import { Local } from '../../types';
import MaterialIcon from '../MaterialIcon';
import Modal from '../Modal';
import './styles.css';

interface ListaLocalProps {
  filtros: {
    busca?: string;
    tipo?: string;
    capacidadeMin?: number;
    capacidadeMax?: number;
  };
  onEditar: (local: Local) => void;
  atualizar: boolean;
  onAtualizarComplete: () => void;
}

export default function ListaLocal({ 
  filtros, 
  onEditar, 
  atualizar, 
  onAtualizarComplete 
}: ListaLocalProps) {
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [localParaExcluir, setLocalParaExcluir] = useState<Local | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const itemsPorPagina = 12;

  const carregarLocais = async () => {
    try {
      setLoading(true);
      const response = await localService.listarLocais({
        page: paginaAtual,
        limit: itemsPorPagina,
        search: filtros.busca,
        tipoLocal: filtros.tipo,
        capacidadeMin: filtros.capacidadeMin
      });
      
      setLocais(response.data || []);
      setTotalPaginas(Math.ceil((response.data?.length || 0) / itemsPorPagina));
      setError(null);
    } catch (err) {
      console.error('Erro ao carregar locais:', err);
      setError('Erro ao carregar locais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLocais();
  }, [paginaAtual, filtros]);

  useEffect(() => {
    if (atualizar) {
      carregarLocais();
      onAtualizarComplete();
    }
  }, [atualizar]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [filtros]);

  const handleDelete = async (id: string) => {
    setExcluindo(true);
    try {
      await localService.deletarLocal(id);
      setLocalParaExcluir(null);
      await carregarLocais();
    } catch (err) {
      console.error('Erro ao deletar local:', err);
      setError('Erro ao deletar local. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  };

  const abrirModalExclusao = (local: Local) => {
    setLocalParaExcluir(local);
  };

  const fecharModalExclusao = () => {
    setLocalParaExcluir(null);
  };

  const getTipoIcon = (tipo: string) => {
    const icons = {
      'Sala de Aula': 'school',
      'Biblioteca': 'local_library',
      'Laboratório': 'science',
      'Auditório': 'theater_comedy',
      'Anfiteatro': 'event_seat',
      'Pátio': 'park',
      'Quadra': 'sports_soccer',
      'Espaço': 'landscape'
    };
    return icons[tipo as keyof typeof icons] || 'room';
  };

  const getTipoColor = (tipo: string) => {
    const colors = {
      'Sala de Aula': 'tipo-aula',
      'Biblioteca': 'tipo-biblioteca',
      'Laboratório': 'tipo-laboratorio',
      'Auditório': 'tipo-auditorio',
      'Anfiteatro': 'tipo-anfiteatro',
      'Pátio': 'tipo-patio',
      'Quadra': 'tipo-quadra',
      'Espaço': 'tipo-espaco'
    };
    return colors[tipo as keyof typeof colors] || 'tipo-aula';
  };

  if (loading) {
    return (
      <div className="lista-loading">
        <MaterialIcon name="autorenew" className="spinning" />
        <p>Carregando locais...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lista-error">
        <MaterialIcon name="error_outline" />
        <p>{error}</p>
        <button onClick={carregarLocais} className="btn btn-primary">
          <MaterialIcon name="refresh" />
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="lista-local">
      {locais.length === 0 ? (
        <div className="lista-vazia">
          <MaterialIcon name="location_on" />
          <h3>Nenhum local encontrado</h3>
          <p>Não há locais que correspondem aos filtros aplicados.</p>
        </div>
      ) : (
        <>
          <div className="local-grid">
            {locais.map((local) => (
              <div key={local._id} className="local-card">
                <div className="local-header">
                  <div className="local-codigo">
                    <MaterialIcon name={getTipoIcon(local.tipoLocal)} />
                    <span>{local.cod}</span>
                  </div>
                  <div className={`local-tipo ${getTipoColor(local.tipoLocal)}`}>
                    {local.tipoLocal}
                  </div>
                </div>

                <div className="local-content">
                  <h4 className="local-nome">{local.nome}</h4>
                  
                  {local.descricao && (
                    <div className="local-descricao">
                      <MaterialIcon name="place" />
                      <span>{local.descricao}</span>
                    </div>
                  )}
                  
                  <div className="local-capacidade">
                    <MaterialIcon name="people" />
                    <span>
                      {local.tipoLocal === 'Espaço' && local.capacidade >= 999999 
                        ? 'Capacidade livre' 
                        : `${local.capacidade} pessoas`
                      }
                    </span>
                  </div>
                </div>

                <div className="local-actions">
                  <button
                    onClick={() => onEditar(local)}
                    className="btn-action btn-edit"
                    title="Editar local"
                  >
                    <MaterialIcon name="edit" />
                  </button>
                  <button
                    onClick={() => abrirModalExclusao(local)}
                    className="btn-action btn-delete"
                    title="Excluir local"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPaginas > 1 && (
            <div className="paginacao">
              <button
                onClick={() => setPaginaAtual(prev => Math.max(1, prev - 1))}
                disabled={paginaAtual === 1}
                className="btn-paginacao"
              >
                <MaterialIcon name="chevron_left" />
                Anterior
              </button>

              <div className="paginacao-info">
                <span>Página {paginaAtual} de {totalPaginas}</span>
              </div>

              <button
                onClick={() => setPaginaAtual(prev => Math.min(totalPaginas, prev + 1))}
                disabled={paginaAtual === totalPaginas}
                className="btn-paginacao"
              >
                Próxima
                <MaterialIcon name="chevron_right" />
              </button>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={!!localParaExcluir}
        onClose={fecharModalExclusao}
        title="Confirmar Exclusão"
        size="small"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '20px', textAlign: 'center' }}>
            Deseja realmente excluir o local <strong>{localParaExcluir?.nome}</strong>?
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
              onClick={() => localParaExcluir?._id && handleDelete(localParaExcluir._id)}
              disabled={excluindo}
            >
              <MaterialIcon name="delete" /> {excluindo ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
