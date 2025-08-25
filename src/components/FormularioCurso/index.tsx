import React, { useEffect, useState } from 'react';
import { Curso } from '../../types';
import { cursoService } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface Props {
  cursoParaEditar?: Curso | null;
  onSalvo?: () => void;
  onCancelar?: () => void;
}

export default function FormularioCurso({ cursoParaEditar, onSalvo, onCancelar }: Props) {
  const [formData, setFormData] = useState<Omit<Curso, '_id'>>({ cod: '', nome: '' });
  const [errors, setErrors] = useState<{ nome?: string }>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (cursoParaEditar) {
      setFormData({ cod: cursoParaEditar.cod, nome: cursoParaEditar.nome });
    } else {
      setFormData({ cod: '', nome: '' });
    }
  }, [cursoParaEditar]);

  const validar = () => {
    const e: { nome?: string } = {};
    if (!formData.nome.trim()) e.nome = 'Nome é obrigatório';
    if (formData.nome.trim().length < 2 || formData.nome.trim().length > 100) e.nome = 'Nome deve ter entre 2 e 100 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setSalvando(true);
    try {
      if (cursoParaEditar && cursoParaEditar._id) {
        const resp = await cursoService.atualizarCurso(cursoParaEditar._id, formData);
        if (!resp.success) throw new Error(resp.message || 'Falha ao atualizar');
      } else {
  // Para novos cursos, enviar apenas o nome - o código será gerado no backend
  const resp = await cursoService.criarCurso({ nome: formData.nome });
        if (!resp.success) throw new Error(resp.message || 'Falha ao criar');
      }
      onSalvo?.();
    } catch (err: any) {
      const msg = err?.message || 'Erro ao salvar curso';
      alert(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="form-curso-card">
      <div className="form-curso-header">
        <MaterialIcon name="school" className="material-icon--primary" />
        <h3>{cursoParaEditar ? 'Editar Curso' : 'Novo Curso'}</h3>
      </div>
      <form onSubmit={handleSubmit} className="form-curso-grid">
        <div className="form-field">
          <label htmlFor="nome">Nome do curso</label>
          <input
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex.: Sistemas de Informação"
            maxLength={100}
          />
          {errors.nome && <span className="error-text">{errors.nome}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancelar} disabled={salvando}>
            <MaterialIcon name="close" /> Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            <MaterialIcon name="save" /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
