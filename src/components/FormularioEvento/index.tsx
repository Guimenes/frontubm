import React, { useState, useEffect } from 'react';
import { Evento, Local, Curso } from '../../types';
import { eventoService, localService, cursoService } from '../../services/api';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FormularioEventoProps {
  evento?: Evento;
  onSalvar: () => void;
  onCancelar: () => void;
}

const FormularioEvento: React.FC<FormularioEventoProps> = ({
  evento,
  onSalvar,
  onCancelar
}) => {
  const [formData, setFormData] = useState({
    data: '',
    hora: '',
    duracao: 60, // Duração padrão em minutos
    tema: '',
    autores: [''], // Array de autores
    palestrante: '',
    orientador: '', // Novo campo orientador
    sala: '',
    tipoEvento: 'Apresentação de Trabalhos' as 'Palestra Principal' | 'Apresentação de Trabalhos' | 'Oficina' | 'Banner',
    cursos: [] as string[], // IDs dos cursos selecionados (opcional)
    resumo: ''
  });

  const [locais, setLocais] = useState<Local[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocais, setLoadingLocais] = useState(true);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [verificandoConflito, setVerificandoConflito] = useState(false);
  const [buscaCurso, setBuscaCurso] = useState('');
  const [eventoGeral, setEventoGeral] = useState(false);

  useEffect(() => {
    if (evento) {
      const dataFormatada = evento.data ? new Date(evento.data).toISOString().split('T')[0] : '';
      const horaFormatada = evento.hora ? new Date(evento.hora).toTimeString().slice(0, 5) : '';
      
      setFormData({
        data: dataFormatada,
        hora: horaFormatada,
        duracao: evento.duracao || 60, // Duração padrão de 60 minutos se não especificada
        tema: evento.tema || '',
        autores: evento.autores || [''],
        palestrante: evento.palestrante || '',
        orientador: evento.orientador || '',
        sala: evento.sala || '',
        tipoEvento: evento.tipoEvento || 'Apresentação de Trabalhos',
        cursos: Array.isArray((evento as any).cursos)
          ? (evento as any).cursos.map((c: any) => (typeof c === 'string' ? c : c?._id)).filter(Boolean)
          : (evento.curso ? [typeof evento.curso === 'string' ? evento.curso : (evento.curso as any)?._id].filter(Boolean) : []),
        resumo: evento.resumo || ''
      });
      const temCursos = Array.isArray((evento as any).cursos)
        ? (evento as any).cursos.length > 0
        : !!evento.curso;
      setEventoGeral(!temCursos);
    }
    carregarLocais();
    carregarCursos();
  }, [evento]);

  const carregarLocais = async () => {
    setLoadingLocais(true);
    try {
      const response = await localService.listarLocais({limit: 1000});
      if (response.success && response.data) {
        setLocais(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    } finally {
      setLoadingLocais(false);
    }
  };

  const carregarCursos = async () => {
    setLoadingCursos(true);
    try {
      // Busca mais cursos que o padrão (10) para garantir que o novo apareça na lista
      const response = await cursoService.listarCursos({ limit: 1000 });
      if (response.success && response.data) {
        setCursos(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoadingCursos(false);
    }
  };

  const verificarConflitoHorario = async (data: string, hora: string, cursosSel: string[], sala: string): Promise<boolean> => {
    if (!data || !hora || !cursosSel || cursosSel.length === 0 || !sala) return false;

    setVerificandoConflito(true);
    try {
      // Buscar eventos existentes para cada curso selecionado, na mesma data e hora
      for (const curso of cursosSel) {
        const response = await eventoService.listarEventos({
          data,
          curso,
          local: sala, // Adiciona filtro por local
          limit: 1000 // Buscar todos os eventos para ter certeza
        });

        if (response.success && response.data) {
          const eventosConflitantes = response.data.filter((eventoExistente: Evento) => {
            // Se estamos editando, excluir o próprio evento da verificação
            if (evento?._id && eventoExistente._id === evento._id) {
              return false;
            }

            // Verificar se é o mesmo horário e local
            const horaExistente = new Date(eventoExistente.hora).toTimeString().slice(0, 5);
            const mesmoHorario = horaExistente === hora;
            const mesmoLocal = eventoExistente.sala === sala;
            
            return mesmoHorario && mesmoLocal;
          });

          if (eventosConflitantes.length > 0) return true;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conflito:', error);
    } finally {
      setVerificandoConflito(false);
    }

    return false;
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    
    // cursos agora são tratados pelos handlers dedicados (checkboxes)

    // Se mudou o tipo de evento para "Palestra Principal", limpar autores e orientador
    if (name === 'tipoEvento' && value === 'Palestra Principal') {
      newFormData.autores = [''];
      newFormData.orientador = '';
    }
    
    setFormData(newFormData);
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }

    // Verificar conflito de horário quando data, hora, cursos ou sala mudarem
  if ((name === 'data' || name === 'hora' || name === 'sala') && 
        newFormData.data && newFormData.hora && newFormData.cursos && newFormData.cursos.length > 0 && newFormData.sala) {
      
      const temConflito = await verificarConflitoHorario(
        newFormData.data, 
        newFormData.hora, 
        newFormData.cursos,
        newFormData.sala
      );

      if (temConflito) {
        setErrors((prev: any) => ({
          ...prev,
          conflito: 'Já existe um evento para este curso no mesmo dia e horário'
        }));
      } else {
        setErrors((prev: any) => ({
          ...prev,
          conflito: ''
        }));
      }
    }
  };

  // Handlers de cursos (checkboxes)
  const cursosFiltrados = cursos.filter(c => {
    if (!buscaCurso.trim()) return true;
    const termo = buscaCurso.toLowerCase();
    return c.nome.toLowerCase().includes(termo) || (c.cod || '').toLowerCase().includes(termo);
  });

  const toggleCurso = async (cursoId: string) => {
    const selecionados = new Set(formData.cursos);
    if (selecionados.has(cursoId)) {
      selecionados.delete(cursoId);
    } else {
      selecionados.add(cursoId);
    }
    const novos = Array.from(selecionados);
    setFormData(prev => ({ ...prev, cursos: novos }));
    setEventoGeral(novos.length === 0);

    // Revalida conflito se temos data/hora
    if (formData.data && formData.hora && novos.length > 0 && formData.sala) {
      const temConflito = await verificarConflitoHorario(formData.data, formData.hora, novos, formData.sala);
      setErrors((prev: any) => ({ ...prev, conflito: temConflito ? 'Já existe um evento para este curso neste local e horário' : '' }));
    } else {
      setErrors((prev: any) => ({ ...prev, conflito: '' }));
    }
  };

  const selecionarTodos = () => {
    const todosIds = cursosFiltrados.map(c => c._id!).filter(Boolean);
    setFormData(prev => ({ ...prev, cursos: todosIds }));
    setEventoGeral(todosIds.length === 0);
  };

  const limparCursos = () => {
    setFormData(prev => ({ ...prev, cursos: [] }));
    setEventoGeral(true);
  setErrors((prev: any) => ({ ...prev, conflito: '' }));
  };

  const toggleEventoGeral = () => {
    const novo = !eventoGeral;
    setEventoGeral(novo);
    if (novo) {
      // Limpa cursos quando marcar evento geral
      setFormData(prev => ({ ...prev, cursos: [] }));
  setErrors((prev: any) => ({ ...prev, conflito: '' }));
    }
  };

  const handleAutorChange = (index: number, value: string) => {
    const novosAutores = [...formData.autores];
    novosAutores[index] = value;
    setFormData({
      ...formData,
      autores: novosAutores
    });
    
    // Limpar erro de autores
    if (errors.autores) {
      setErrors((prev: any) => ({
        ...prev,
        autores: ''
      }));
    }
  };

  const adicionarAutor = () => {
    setFormData({
      ...formData,
      autores: [...formData.autores, '']
    });
  };

  const removerAutor = (index: number) => {
    if (formData.autores.length > 1) {
      const novosAutores = formData.autores.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        autores: novosAutores
      });
    }
  };

  const validateForm = async () => {
    const novosErros: any = {};

    if (!formData.data) novosErros.data = 'Data é obrigatória';
    if (!formData.hora) novosErros.hora = 'Hora é obrigatória';
    if (!formData.tema.trim()) novosErros.tema = 'Tema é obrigatório';
    if (!formData.sala) novosErros.sala = 'Local é obrigatório';

    // Cursos são opcionais agora; se nenhum selecionado, será evento geral

    // Validações específicas por tipo de evento
    if (formData.tipoEvento === 'Palestra Principal') {
      if (!formData.palestrante.trim()) {
        novosErros.palestrante = 'Palestrante é obrigatório para Palestra Principal';
      }
    } else {
      // Para outros tipos (Apresentação de Trabalhos, Oficina e Banner), validar autores
      const autoresPreenchidos = formData.autores.filter(autor => autor.trim() !== '');
      if (autoresPreenchidos.length === 0) {
        novosErros.autores = 'Pelo menos um autor é obrigatório';
      }
    }

    // Verificar conflito de horário se todos os campos necessários estão preenchidos
    if (formData.data && formData.hora && formData.cursos && formData.cursos.length > 0 && formData.sala) {
      const temConflito = await verificarConflitoHorario(
        formData.data, 
        formData.hora, 
        formData.cursos,
        formData.sala
      );

      if (temConflito) {
        novosErros.conflito = 'Já existe um evento neste local e horário';
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    
    try {
      // Preparar dados para envio (sem o código, será gerado automaticamente)
      // Construir datas em horário local para evitar mudança de dia por fuso (ex.: -03:00)
      const [anoStr, mesStr, diaStr] = formData.data.split('-');
      const ano = Number(anoStr);
      const mes = Number(mesStr) - 1; // mês 0-based
      const dia = Number(diaStr);
      const [horaStr, minutoStr] = formData.hora.split(':');
      const horaNum = Number(horaStr);
      const minutoNum = Number(minutoStr);

      const dadosEvento: any = {
        ...formData,
        // Data do evento à meia-noite local
        data: new Date(ano, mes, dia, 0, 0, 0, 0),
        // Hora do evento em uma data fixa, também local
        hora: new Date(2000, 0, 1, horaNum, minutoNum, 0, 0),
        // Filtrar autores vazios
        autores: formData.autores.filter(autor => autor.trim() !== ''),
        // Enviar cursos selecionados (pode ser vazio para evento geral)
        cursos: formData.cursos
        // O código será gerado automaticamente pelo backend
      };

      // Garantir que não enviamos campos legados
      delete (dadosEvento as any).curso;
      delete (dadosEvento as any).atrelarCurso;

      let response;
      if (evento?._id) {
        response = await eventoService.atualizarEvento(evento._id, dadosEvento);
      } else {
        response = await eventoService.criarEvento(dadosEvento);
      }

      if (response.success && response.data) {
        onSalvar();
      } else {
        if (response.errors) {
          const novosErros: any = {};
          response.errors.forEach((error: any) => {
            if (error.path) {
              novosErros[error.path] = error.msg;
            }
          });
          setErrors(novosErros);
        } else {
          alert(response.message || 'Erro ao salvar evento');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      alert('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-evento">
      <div className="formulario-header">
        <h3>
          <MaterialIcon name={evento ? "edit" : "add"} size="medium" />
          {evento ? 'Editar Evento' : 'Novo Evento'}
        </h3>
      </div>

      {errors.conflito && (
        <div className="alert alert-error">
          <MaterialIcon name="warning" size="small" />
          {errors.conflito}
        </div>
      )}

      {verificandoConflito && (
        <div className="alert alert-info">
          <MaterialIcon name="hourglass_empty" size="small" />
          Verificando conflitos de horário...
        </div>
      )}

      <form onSubmit={handleSubmit} className="formulario">
        <div className="formulario-row">
          <div className="form-group">
            <label htmlFor="tipoEvento">Tipo de Evento *</label>
            <select
              id="tipoEvento"
              name="tipoEvento"
              value={formData.tipoEvento}
              onChange={handleChange}
              className={errors.tipoEvento ? 'error' : ''}
            >
              <option value="Palestra Principal">Palestra Principal</option>
              <option value="Apresentação de Trabalhos">Apresentação de Trabalhos</option>
              <option value="Oficina">Oficina</option>
              <option value="Banner">Banner</option>
            </select>
            {errors.tipoEvento && <span className="error-message">{errors.tipoEvento}</span>}
          </div>
        </div>

        <div className="formulario-row">
          <div className="form-group">
            <label>Cursos (opcional)</label>
            <div className="cursos-selector">
              <div className="cursos-header">
                <div className="input-with-icon cursos-search">
                  <MaterialIcon name="search" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou código do curso..."
                    value={buscaCurso}
                    onChange={(e) => setBuscaCurso(e.target.value)}
                    disabled={loadingCursos}
                  />
                </div>
                <div className="cursos-actions">
                  <button type="button" className="btn btn-secondary" onClick={selecionarTodos} disabled={loadingCursos || cursosFiltrados.length === 0}>
                    <MaterialIcon name="done_all" size="small" /> Selecionar todos
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={limparCursos} disabled={loadingCursos || formData.cursos.length === 0}>
                    <MaterialIcon name="clear" size="small" /> Limpar
                  </button>
                  <label className="checkbox-inline">
                    <input type="checkbox" checked={eventoGeral} onChange={toggleEventoGeral} /> Evento geral
                  </label>
                </div>
              </div>

              <div className="cursos-body">
                {loadingCursos ? (
                  <div className="loading-message">Carregando cursos...</div>
                ) : cursosFiltrados.length === 0 ? (
                  <div className="empty-state">Nenhum curso encontrado</div>
                ) : (
                  <div className="cursos-list">
                    {cursosFiltrados.map(c => {
                      const selected = formData.cursos.includes(c._id!);
                      return (
                        <label key={c._id} className={`curso-item ${selected ? 'selected' : ''}`}>
                          <input type="checkbox" checked={selected} onChange={() => toggleCurso(c._id!)} disabled={eventoGeral} />
                          <span className="curso-cod">{c.cod}</span>
                          <span className="curso-nome">{c.nome}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="cursos-footer">
                <div className="chips">
                  {formData.cursos.map(id => {
                    const c = cursos.find(cc => cc._id === id);
                    if (!c) return null;
                    return (
                      <span key={id} className="chip">
                        <span className="chip-label">{c.cod}</span>
                        <button type="button" className="chip-remove" onClick={() => toggleCurso(id)}>
                          <MaterialIcon name="close" size="small" />
                        </button>
                      </span>
                    );
                  })}
                  {formData.cursos.length === 0 && <span className="hint">Sem cursos selecionados — este será um Evento Geral.</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="formulario-row">
          <div className="form-group">
            <label htmlFor="data">Data *</label>
            <select
              id="data"
              name="data"
              value={formData.data}
              onChange={handleChange}
              className={errors.data ? 'error' : ''}
            >
              <option value="">Selecione uma data</option>
              <option value="2025-10-21">21 de Outubro de 2025</option>
              <option value="2025-10-22">22 de Outubro de 2025</option>
              <option value="2025-10-23">23 de Outubro de 2025</option>
            </select>
            {errors.data && <span className="error-message">{errors.data}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="hora">Hora *</label>
            <input
              type="time"
              id="hora"
              name="hora"
              value={formData.hora}
              onChange={handleChange}
              className={errors.hora ? 'error' : ''}
            />
            {errors.hora && <span className="error-message">{errors.hora}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duracao">Duração (minutos) *</label>
            <select
              id="duracao"
              name="duracao"
              value={formData.duracao}
              onChange={handleChange}
              className={errors.duracao ? 'error' : ''}
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora (60 min)</option>
              <option value={90}>1h 30min (90 min)</option>
              <option value={120}>2 horas (120 min)</option>
              <option value={150}>2h 30min (150 min)</option>
              <option value={180}>3 horas (180 min)</option>
            </select>
            {errors.duracao && <span className="error-message">{errors.duracao}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="sala">Local *</label>
            <select
              id="sala"
              name="sala"
              value={formData.sala}
              onChange={handleChange}
              className={errors.sala ? 'error' : ''}
              disabled={loadingLocais}
            >
              <option value="">Selecione um local</option>
              {locais.map(local => (
                <option key={local._id} value={`${local.nome} (${local.cod})`}>
                  {local.nome} ({local.cod}) - Cap: {local.capacidade}
                </option>
              ))}
            </select>
            {loadingLocais && <span className="loading-message">Carregando locais...</span>}
            {errors.sala && <span className="error-message">{errors.sala}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tema">Tema/Título *</label>
          <input
            type="text"
            id="tema"
            name="tema"
            value={formData.tema}
            onChange={handleChange}
            className={errors.tema ? 'error' : ''}
            placeholder="Título do evento ou apresentação"
          />
          {errors.tema && <span className="error-message">{errors.tema}</span>}
        </div>

        {/* Campos condicionais baseados no tipo de evento */}
        {formData.tipoEvento === 'Palestra Principal' ? (
          <div className="form-group">
            <label htmlFor="palestrante">Palestrante *</label>
            <input
              type="text"
              id="palestrante"
              name="palestrante"
              value={formData.palestrante}
              onChange={handleChange}
              className={errors.palestrante ? 'error' : ''}
              placeholder="Nome do palestrante"
            />
            {errors.palestrante && <span className="error-message">{errors.palestrante}</span>}
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Autores *</label>
              <div className="autores-container">
                {formData.autores.map((autor, index) => (
                  <div key={index} className="autor-input-group">
                    <input
                      type="text"
                      value={autor}
                      onChange={(e) => handleAutorChange(index, e.target.value)}
                      placeholder={`Autor ${index + 1}`}
                      className={errors.autores ? 'error' : ''}
                    />
                    {formData.autores.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerAutor(index)}
                        className="btn-remover-autor"
                        title="Remover autor"
                      >
                        <MaterialIcon name="remove" size="small" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={adicionarAutor}
                  className="btn-adicionar-autor"
                >
                  <MaterialIcon name="add" size="small" />
                  Adicionar Autor
                </button>
              </div>
              {errors.autores && <span className="error-message">{errors.autores}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="orientador">Orientador</label>
              <input
                type="text"
                id="orientador"
                name="orientador"
                value={formData.orientador}
                onChange={handleChange}
                placeholder="Nome do orientador (opcional)"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="resumo">Resumo</label>
          <textarea
            id="resumo"
            name="resumo"
            value={formData.resumo}
            onChange={handleChange}
            rows={4}
            placeholder="Resumo opcional do evento (máximo 1000 caracteres)"
            maxLength={1000}
          />
          <div className="char-count">
            {formData.resumo.length}/1000 caracteres
          </div>
        </div>

        <div className="formulario-actions">
          <button
            type="button"
            onClick={onCancelar}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <MaterialIcon name="hourglass_empty" size="small" />
                Salvando...
              </>
            ) : (
              <>
                <MaterialIcon name="save" size="small" />
                {evento ? 'Atualizar' : 'Salvar'} Evento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioEvento;
