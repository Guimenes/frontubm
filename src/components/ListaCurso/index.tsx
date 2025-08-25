import { useEffect, useState } from 'react';
import { Curso } from '../../types';
import { cursoService } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import Modal from '../Modal';
import './styles.css';

interface Props {
  filtros?: { 
    busca?: string;
    status?: string;
    modalidade?: string;
  };
  atualizarLista?: boolean;
  onEdit?: (curso: Curso) => void;
}

export default function ListaCurso({ filtros, atualizarLista, onEdit }: Props) {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [pagination, setPagination] = useState<{ currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number } | null>(null);
  const [cursoParaExcluir, setCursoParaExcluir] = useState<Curso | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregar = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await cursoService.listarCursos({ 
        page, 
        limit, 
        search: filtros?.busca,
        status: filtros?.status,
        modalidade: filtros?.modalidade
      });
      if (!resp.success) {
        throw new Error(resp.message || 'Falha ao carregar cursos');
      }
      setCursos(resp.data || []);
      setPagination(resp.pagination || null);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filtros?.busca, filtros?.status, filtros?.modalidade]);

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, atualizarLista, filtros?.busca, filtros?.status, filtros?.modalidade]);

  const handleDelete = async (id: string) => {
    setExcluindo(true);
    try {
      const resp = await cursoService.deletarCurso(id);
      if (!resp.success) {
        alert(resp.message || 'Falha ao excluir');
        return;
      }
      setCursoParaExcluir(null);
      carregar();
    } catch (error) {
      alert('Erro ao excluir curso');
    } finally {
      setExcluindo(false);
    }
  };

  const abrirModalExclusao = (curso: Curso) => {
    setCursoParaExcluir(curso);
  };

  const fecharModalExclusao = () => {
    setCursoParaExcluir(null);
  };

  if (loading) return <div className="lista-curso-loader">Carregando cursos...</div>;
  if (error) return <div className="lista-curso-erro">{error}</div>;

  return (
    <div className="lista-curso-wrapper">
      {cursos.length === 0 ? (
        <div className="lista-curso-vazio">
          <MaterialIcon name="inbox" /> Nenhum curso encontrado
        </div>
      ) : (
        <div className="grid-cursos">
          {cursos.map(c => (
            <div key={c._id || c.cod} className="curso-card">
              <div className="curso-card-header">
                <div className="curso-avatar">{c.cod ? c.cod.substring(0, 2) : 'XX'}</div>
                <div className="curso-titles">
                  <h4 title={c.nome}>{c.nome || 'Nome não definido'}</h4>
                  <span className="curso-cod">{c.cod || 'Código não definido'}</span>
                </div>
              </div>
              <div className="curso-actions">
                <button
                  onClick={() => onEdit?.(c)}
                  className="btn-action btn-edit"
                  title="Editar curso"
                >
                  <MaterialIcon name="edit" />
                </button>
                {c._id && (
                  <button
                    onClick={() => abrirModalExclusao(c)}
                    className="btn-action btn-delete"
                    title="Excluir curso"
                  >
                    <MaterialIcon name="delete" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="paginacao">
          <button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
            <MaterialIcon name="chevron_left" /> Anterior
          </button>
          <span>
            Página {pagination.currentPage} de {pagination.totalPages}
          </span>
          <button className="btn" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
            Próxima <MaterialIcon name="chevron_right" />
          </button>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      <Modal
        isOpen={!!cursoParaExcluir}
        onClose={fecharModalExclusao}
        title="Confirmar Exclusão"
        size="small"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '20px', textAlign: 'center' }}>
            Deseja realmente excluir o curso <strong>{cursoParaExcluir?.nome}</strong>?
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
              onClick={() => cursoParaExcluir?._id && handleDelete(cursoParaExcluir._id)}
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
