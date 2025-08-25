import { useState, useEffect } from 'react';
import { localService } from '../../services/api';
import { Local } from '../../types';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FormularioLocalProps {
  localParaEditar?: Local | null;
  onSalvar: () => void;
  onCancelar: () => void;
}

export default function FormularioLocal({ localParaEditar, onSalvar, onCancelar }: FormularioLocalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    capacidade: '',
    descricao: '',
    tipoLocal: 'Sala de Aula' as 'Sala de Aula' | 'Biblioteca' | 'Laboratório' | 'Auditório' | 'Anfiteatro' | 'Pátio' | 'Quadra' | 'Espaço'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tiposLocal = [
    { value: 'Sala de Aula', label: 'Sala de Aula', icon: 'school' },
    { value: 'Biblioteca', label: 'Biblioteca', icon: 'local_library' },
    { value: 'Laboratório', label: 'Laboratório', icon: 'science' },
    { value: 'Auditório', label: 'Auditório', icon: 'theater_comedy' },
    { value: 'Anfiteatro', label: 'Anfiteatro', icon: 'event_seat' },
    { value: 'Pátio', label: 'Pátio', icon: 'park' },
    { value: 'Quadra', label: 'Quadra', icon: 'sports_soccer' },
    { value: 'Espaço', label: 'Espaço', icon: 'landscape' }
  ];

  useEffect(() => {
    if (localParaEditar) {
      setFormData({
        nome: localParaEditar.nome,
        capacidade: localParaEditar.capacidade.toString(),
        descricao: localParaEditar.descricao || '',
        tipoLocal: localParaEditar.tipoLocal
      });
    } else {
      setFormData({
        nome: '',
        capacidade: '',
        descricao: '',
        tipoLocal: 'Sala de Aula'
      });
    }
    setErrors({});
  }, [localParaEditar]);

  const handleInputChange = (campo: string, valor: string) => {
    let novoValor = valor;
    
    if (campo === 'capacidade') {
      novoValor = valor.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [campo]: novoValor
    }));

    if (errors[campo]) {
      setErrors(prev => ({
        ...prev,
        [campo]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const novosErros: Record<string, string> = {};

    if (!formData.nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      novosErros.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Para tipo "Espaço", capacidade não é obrigatória
    if (formData.tipoLocal !== 'Espaço') {
      if (!formData.capacidade) {
        novosErros.capacidade = 'Capacidade é obrigatória';
      } else {
        const capacidade = parseInt(formData.capacidade);
        if (isNaN(capacidade) || capacidade < 1) {
          novosErros.capacidade = 'Capacidade deve ser um número maior que 0';
        } else if (capacidade > 10000) {
          novosErros.capacidade = 'Capacidade não pode ser maior que 10000';
        }
      }
    } else {
      // Para espaços, se informado a capacidade, deve ser válida
      if (formData.capacidade) {
        const capacidade = parseInt(formData.capacidade);
        if (isNaN(capacidade) || capacidade < 1) {
          novosErros.capacidade = 'Se informada, capacidade deve ser um número maior que 0';
        } else if (capacidade > 10000) {
          novosErros.capacidade = 'Capacidade não pode ser maior que 10000';
        }
      }
    }

    if (formData.descricao && formData.descricao.length > 500) {
      novosErros.descricao = 'Descrição não pode ter mais de 500 caracteres';
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const localData = {
        nome: formData.nome.trim(),
        capacidade: formData.tipoLocal === 'Espaço' && !formData.capacidade 
          ? 999999 // Valor alto para indicar capacidade livre
          : parseInt(formData.capacidade),
        tipoLocal: formData.tipoLocal,
        descricao: formData.descricao.trim() || undefined
      };

      const resp = localParaEditar
        ? await localService.atualizarLocal(localParaEditar._id!, localData)
        : await localService.criarLocal(localData);

      if (!resp?.success) {
        const backendErrors = resp?.errors as Array<{ msg?: string; param?: string }> | undefined;
        if (backendErrors && backendErrors.length) {
          const mapped: Record<string, string> = {};
          backendErrors.forEach(er => {
            if (er.param) mapped[er.param] = er.msg || 'Valor inválido';
          });
          setErrors(prev => ({ ...prev, ...mapped, geral: resp.message || 'Falha na validação' }));
        } else {
          setErrors(prev => ({ ...prev, geral: resp?.message || 'Erro ao salvar local' }));
        }
        return;
      }

      onSalvar();
    } catch (error: any) {
      console.error('Erro ao salvar local:', error);
      setErrors(prev => ({ ...prev, geral: 'Erro ao salvar local. Tente novamente.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-local">
      <form onSubmit={handleSubmit} className="formulario">
        {errors.geral && (
          <div className="error-message">
            <MaterialIcon name="error" />
            {errors.geral}
          </div>
        )}

        <div className="formulario-row">
          <div className="form-group">
            <label htmlFor="tipoLocal">Tipo de Local *</label>
            <select
              id="tipoLocal"
              value={formData.tipoLocal}
              onChange={(e) => handleInputChange('tipoLocal', e.target.value)}
              className={errors.tipoLocal ? 'error' : ''}
            >
              {tiposLocal.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipoLocal && (
              <span className="error-message">
                <MaterialIcon name="error_outline" />
                {errors.tipoLocal}
              </span>
            )}
          </div>
        </div>

        <div className="formulario-row">
          <div className="form-group">
            <label htmlFor="nome">Nome do Local *</label>
            <input
              type="text"
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Ex: Sala de Aula 101, Biblioteca Central"
              className={errors.nome ? 'error' : ''}
              maxLength={100}
            />
            {errors.nome && (
              <span className="error-message">
                <MaterialIcon name="error_outline" />
                {errors.nome}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="capacidade">
              Capacidade {formData.tipoLocal === 'Espaço' ? '(Opcional)' : '*'}
            </label>
            <input
              type="number"
              id="capacidade"
              value={formData.capacidade}
              onChange={(e) => handleInputChange('capacidade', e.target.value)}
              placeholder={formData.tipoLocal === 'Espaço' 
                ? "Deixe vazio para capacidade livre" 
                : "Ex: 40"
              }
              className={errors.capacidade ? 'error' : ''}
              min="1"
              max="10000"
            />
            {formData.tipoLocal === 'Espaço' && (
              <small className="form-hint">
                Para espaços a céu aberto, deixe vazio para capacidade livre
              </small>
            )}
            {errors.capacidade && (
              <span className="error-message">
                <MaterialIcon name="error_outline" />
                {errors.capacidade}
              </span>
            )}
          </div>
        </div>

        <div className="formulario-row">
          <div className="form-group full-width">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              placeholder="Ex: Localizado no 2º andar do prédio principal, próximo à secretaria. Elevador disponível."
              className={errors.descricao ? 'error' : ''}
              maxLength={500}
              rows={3}
            />
            <small className="form-hint">
              {formData.descricao.length}/500 caracteres - Informe como chegar ao local ou pontos de referência
            </small>
            {errors.descricao && (
              <span className="error-message">
                <MaterialIcon name="error_outline" />
                {errors.descricao}
              </span>
            )}
          </div>
        </div>

        <div className="formulario-actions">
          <button
            type="button"
            onClick={onCancelar}
            className="btn btn-secondary"
            disabled={loading}
          >
            <MaterialIcon name="close" />
            Cancelar
          </button>
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <MaterialIcon name="autorenew" className="spinning" />
                Salvando...
              </>
            ) : (
              <>
                <MaterialIcon name="save" />
                {localParaEditar ? 'Atualizar' : 'Salvar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
