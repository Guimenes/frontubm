// Função atualizada para agrupar eventos por curso
export const obterGruposPorCurso = (
  filtros: { curso: string },
  cursos: any[],
  obterEventosParaVisualizacao: () => any[]
) => {
  // Se o filtro de curso está definido, retorna apenas um grupo correspondente
  if (filtros.curso === 'GERAL') {
    return [{ 
      chave: 'GERAIS', 
      titulo: 'Eventos Gerais', 
      eventos: obterEventosParaVisualizacao().filter(e => {
        const cursosArr = Array.isArray((e as any).cursos) ? (e as any).cursos : [];
        return cursosArr.length === 0 && !e.curso;
      }) 
    }];
  }
  
  if (filtros.curso) {
    const grupoEventos = obterEventosParaVisualizacao().filter(e => {
      const cursosEvento: any[] = Array.isArray((e as any).cursos) ? (e as any).cursos : (e.curso ? [e.curso] : []);
      return cursosEvento.some((c: any) => (typeof c === 'object' ? c._id : c) === filtros.curso);
    });
    const cursoObj = cursos.find(c => c._id === filtros.curso);
    const titulo = cursoObj ? `${cursoObj.cod} - ${cursoObj.nome}` : 'Curso';
    return [{ chave: filtros.curso, titulo, eventos: grupoEventos }];
  }

  // Sem filtro: criar grupos para cada curso + GERAIS
  const mapa = new Map<string, { chave: string; titulo: string; eventos: any[] }>();
  
  // Cursos específicos
  obterEventosParaVisualizacao().forEach(ev => {
    const cursosEvento: any[] = Array.isArray((ev as any).cursos) ? (ev as any).cursos : (ev.curso ? [ev.curso] : []);
    if (cursosEvento.length > 0) {
      cursosEvento.forEach((c: any) => {
        const curso = (typeof c === 'object') ? (c as any) : cursos.find(cc => cc._id === c);
        if (!curso) return;
        const chave = curso._id || `${curso.cod}-${curso.nome}`;
        if (!mapa.has(chave)) {
          mapa.set(chave, { chave, titulo: `${curso.cod} - ${curso.nome}`, eventos: [] });
        }
        mapa.get(chave)!.eventos.push(ev);
      });
    } else {
      // É um evento geral (sem curso)
      if (!mapa.has('GERAIS')) {
        mapa.set('GERAIS', { chave: 'GERAIS', titulo: 'Eventos Gerais', eventos: [] });
      }
      mapa.get('GERAIS')!.eventos.push(ev);
    }
  });
  
  // Ordena por título, mantendo GERAIS por último
  const grupos = Array.from(mapa.values()).sort((a, b) => {
    if (a.chave === 'GERAIS') return 1;
    if (b.chave === 'GERAIS') return -1;
    return a.titulo.localeCompare(b.titulo, 'pt-BR');
  });
  return grupos;
};