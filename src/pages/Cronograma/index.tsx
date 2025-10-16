import { useState, useEffect } from "react";
import { Evento, Curso, Local } from "../../types";
import { eventoService, cursoService, localService } from "../../services/api";
import MaterialIcon from "../../components/MaterialIcon";
import Modal from "../../components/Modal";
import ErrorState from "../../components/ErrorState";
import LoadingState from "../../components/LoadingState";
import "./styles.css";

const Cronograma = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(
    null
  );
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [diaAtualMobile, setDiaAtualMobile] = useState<string>("");
  const [filtros, setFiltros] = useState({
    curso: "",
    data: "",
    tipoEvento: "",
  });
  // Visualização fixa em grade

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError("");

      // Carregar cursos do backend
      const responseCursos = await cursoService.listarCursos({ limit: 1000 });
      if (responseCursos.success && responseCursos.data) {
        setCursos(responseCursos.data);
      } else {
        console.error("Erro ao carregar cursos:", responseCursos.message);
        setCursos([]);
        setError(
          "Erro ao carregar cursos: " +
            (responseCursos.message || "Erro desconhecido")
        );
      }

      // Carregar locais do backend
      const responseLocais = await localService.listarLocais();
      if (responseLocais.success && responseLocais.data) {
        setLocais(responseLocais.data);
      } else {
        console.error("Erro ao carregar locais:", responseLocais.message);
        setLocais([]);
      }

      // Carregar eventos do backend (aumenta o limite para exibir todo o cronograma)
      const responseEventos = await eventoService.listarEventos({
        limit: 1000,
      });
      if (responseEventos.success && responseEventos.data) {
        console.log(
          "Eventos recebidos do backend:",
          responseEventos.data.map((e) => ({
            id: e._id,
            cod: e.cod,
            cursos: e.cursos,
            curso: e.curso,
          }))
        );

        // Converter strings de data para objetos Date
        const eventosComDatas = responseEventos.data.map((evento) => ({
          ...evento,
          data: new Date(evento.data),
          hora: new Date(evento.hora),
        }));
        setEventos(eventosComDatas);

        // Definir o primeiro dia como dia inicial para mobile
        if (eventosComDatas.length > 0 && !diaAtualMobile) {
          const primeiroDia = eventosComDatas[0].data.toDateString();
          setDiaAtualMobile(primeiroDia);
        }
      } else {
        console.error("Erro ao carregar eventos:", responseEventos.message);
        setEventos([]);
        setError(
          "Erro ao carregar eventos: " +
            (responseEventos.message || "Erro desconhecido")
        );
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setEventos([]);
      setCursos([]);
      setLocais([]);
      setError(
        "Erro de conexão com o servidor. Verifique se o backend está rodando."
      );
    } finally {
      setLoading(false);
    }
  };

  const eventosFiltrados = eventos.filter((evento) => {
    const cursoPertence = () => {
      const cursosEvento: any[] = Array.isArray((evento as any).cursos)
        ? (evento as any).cursos
        : evento.curso
        ? [evento.curso]
        : [];
      if (filtros.curso === "") return true; // Todos
      if (filtros.curso === "GERAL") return cursosEvento.length === 0; // Geral
      // Selecione eventos cujo array de cursos contenha o curso filtrado
      return cursosEvento.some(
        (c: any) => (typeof c === "object" ? c._id : c) === filtros.curso
      );
    };

    const dataCorresponde = () => {
      // Se há filtro de data específica, usar ele; caso contrário, mostrar todos os dias
      if (filtros.data !== "") {
        return evento.data.toISOString().split("T")[0] === filtros.data;
      }
      return true;
    };

    return (
      cursoPertence() &&
      (filtros.tipoEvento === "" || evento.tipoEvento === filtros.tipoEvento) &&
      dataCorresponde()
    );
  });

  const handleFiltroChange = (campo: string, valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const limparFiltros = () => {
    setFiltros({
      curso: "",
      data: "",
      tipoEvento: "",
    });
  };

  // formatarHora/formatarData removidos com a Lista Detalhada

  const formatarDataCurta = (data: Date) => {
    return data.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  const obterDiasUnicos = () => {
    const dias = eventos.map((evento) => evento.data.toDateString());
    return [...new Set(dias)].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  };

  // seção de dias removida; função correspondente excluída

  const obterEventosParaVisualizacao = () => {
    // Sempre mostrar todos os dias, aplicando filtros de curso/tipo/data quando houver
    return eventosFiltrados;
  };

  const obterHorariosUnicos = (base?: Evento[]) => {
    const eventosParaHorarios = base ?? obterEventosParaVisualizacao();
    const horariosSet = new Set<string>();

    eventosParaHorarios.forEach((evento) => {
      // Obter horas e minutos diretamente do objeto Date para evitar problemas de fuso
      const eventoHora = evento.hora.getHours();
      const eventoMinuto = evento.hora.getMinutes();
      const inicioMinutos = eventoHora * 60 + eventoMinuto;

      const duracaoEvento = evento.duracao || 60;
      const fimMinutos = inicioMinutos + duracaoEvento;

      // Gera slots de 15 em 15 minutos cobrindo todo o período do evento
      for (let minutos = inicioMinutos; minutos < fimMinutos; minutos += 15) {
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        const horarioFormatado = `${horas}:${mins.toString().padStart(2, "0")}`;
        horariosSet.add(horarioFormatado);
      }

      // Sempre inclui o horário final se for diferente do último slot gerado
      const ultimoSlotMinutos =
        inicioMinutos + Math.floor((duracaoEvento - 1) / 15) * 15;
      if (ultimoSlotMinutos < fimMinutos) {
        const horas = Math.floor(fimMinutos / 60);
        const mins = fimMinutos % 60;
        const horarioFinal = `${horas}:${mins.toString().padStart(2, "0")}`;
        horariosSet.add(horarioFinal);
      }
    });

    return Array.from(horariosSet).sort((a, b) => {
      const [aHora, aMin] = a.split(":").map(Number);
      const [bHora, bMin] = b.split(":").map(Number);
      return aHora * 60 + aMin - (bHora * 60 + bMin);
    });
  };

  const obterEventosPorDiaHorario = (
    dia: string,
    horario: string,
    base?: Evento[]
  ) => {
    const eventosParaBusca = base ?? obterEventosParaVisualizacao();
    return eventosParaBusca.filter((evento) => {
      const eventoDia = evento.data.toDateString();
      if (eventoDia !== dia) return false;

      // Converte horário do slot para minutos desde o início do dia
      const [slotHora, slotMinuto] = horario.split(":").map(Number);
      const slotMinutosDoDia = slotHora * 60 + slotMinuto;

      // Converte horário do evento para minutos desde o início do dia
      // Pegamos as horas e minutos diretamente do Date para evitar problemas de fuso
      const eventoHora = evento.hora.getHours();
      const eventoMinuto = evento.hora.getMinutes();
      const eventoMinutosDoDia = eventoHora * 60 + eventoMinuto;

      // Calcula o fim do evento em minutos
      const duracaoEvento = evento.duracao || 60;
      const eventoFimMinutosDoDia = eventoMinutosDoDia + duracaoEvento;

      // Verifica se o slot está dentro do período do evento (inclusive)
      return (
        slotMinutosDoDia >= eventoMinutosDoDia &&
        slotMinutosDoDia < eventoFimMinutosDoDia
      );
    });
  };

  const calcularSlotsOcupados = (evento: Evento) => {
    const duracaoEvento = evento.duracao || 60;
    // Calcula quantos slots de 15min o evento ocupa
    // Para a visualização, o evento deve ocupar todos os slots até o horário final
    const slotsExatos = duracaoEvento / 15;
    return Math.ceil(slotsExatos);
  };

  const calcularSlotsVisuais = (evento: Evento) => {
    const duracaoEvento = evento.duracao || 60;

    // Calcula quantos slots de 15 minutos o evento deve ocupar
    const slotsCalculados = duracaoEvento / 15;
    return Math.max(Math.ceil(slotsCalculados), 1);
  };

  const obterClasseCard = (
    evento: Evento,
    slotsOcupados: number,
    diasTotal: number
  ) => {
    let classes = [
      `evento-grade`,
      `evento-expandido`,
      evento.tipoEvento.toLowerCase().replace(/\s+/g, "-"),
    ];

    // Adiciona classe baseada no número de dias (para responsividade)
    if (diasTotal >= 3) {
      classes.push("card-compacto");
    }

    // Adiciona classe baseada na duração
    if (slotsOcupados >= 4) {
      classes.push("card-longo");
    } else if (slotsOcupados <= 2) {
      classes.push("card-curto");
    }

    return classes.join(" ");
  };

  const abrirDetalhes = (evento: Evento) => {
    setEventoSelecionado(evento);
    setMostrarDetalhes(true);
  };

  const fecharDetalhes = () => {
    setMostrarDetalhes(false);
    setEventoSelecionado(null);
  };

  const navegarDia = (direcao: "anterior" | "proximo") => {
    const diasDisponiveis = obterDiasUnicos();
    const indiceAtual = diasDisponiveis.indexOf(diaAtualMobile);

    if (direcao === "anterior" && indiceAtual > 0) {
      setDiaAtualMobile(diasDisponiveis[indiceAtual - 1]);
    } else if (
      direcao === "proximo" &&
      indiceAtual < diasDisponiveis.length - 1
    ) {
      setDiaAtualMobile(diasDisponiveis[indiceAtual + 1]);
    }
  };

  const formatarDiaCompleto = (diaString: string) => {
    const data = new Date(diaString);
    return data.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const obterDetalhesLocal = (nomeLocal: string): Local | null => {
    // Tenta encontrar um local que corresponda ao nome ou código
    return (
      locais.find(
        (local) =>
          local.nome === nomeLocal ||
          nomeLocal.includes(local.nome) ||
          nomeLocal.includes(local.cod) ||
          local.nome.includes(nomeLocal)
      ) || null
    );
  };

  // Agrupa eventos por curso, mantendo seção "GERAIS" para sem curso
  const obterGruposPorCurso = () => {
    console.log(
      "Eventos para agrupar:",
      obterEventosParaVisualizacao().map((e) => ({
        id: e._id,
        cod: e.cod,
        cursos: (e as any).cursos,
        curso: e.curso,
      }))
    );

    // Se o filtro de curso está definido, retorna apenas um grupo correspondente
    if (filtros.curso === "GERAL") {
      return [
        {
          chave: "GERAIS",
          titulo: "Eventos Gerais",
          eventos: obterEventosParaVisualizacao().filter((e) => {
            const cursosArr = Array.isArray((e as any).cursos)
              ? (e as any).cursos
              : [];
            return cursosArr.length === 0 && !e.curso;
          }),
        },
      ];
    }

    if (filtros.curso) {
      const grupoEventos = obterEventosParaVisualizacao().filter((e) => {
        const cursosEvento: any[] = Array.isArray((e as any).cursos)
          ? (e as any).cursos
          : e.curso
          ? [e.curso]
          : [];
        return cursosEvento.some(
          (c: any) => (typeof c === "object" ? c._id : c) === filtros.curso
        );
      });
      const cursoObj = cursos.find((c) => c._id === filtros.curso);
      const titulo = cursoObj ? cursoObj.nome : "Curso";
      return [{ chave: filtros.curso, titulo, eventos: grupoEventos }];
    }

    // Sem filtro: criar grupos para cada curso + GERAIS
    const mapa = new Map<
      string,
      { chave: string; titulo: string; eventos: Evento[] }
    >();

    // Cursos específicos
    obterEventosParaVisualizacao().forEach((ev) => {
      const cursosEvento: any[] = Array.isArray((ev as any).cursos)
        ? (ev as any).cursos
        : ev.curso
        ? [ev.curso]
        : [];
      console.log(`Evento ${ev.cod}: cursosEvento =`, cursosEvento);

      if (cursosEvento.length > 0) {
        cursosEvento.forEach((c: any) => {
          const curso =
            typeof c === "object"
              ? (c as any)
              : cursos.find((cc) => cc._id === c);
          console.log(`Processando curso:`, c, "curso encontrado:", curso);

          if (!curso) return;
          const chave = curso._id || `${curso.cod}-${curso.nome}`;
          if (!mapa.has(chave)) {
            mapa.set(chave, {
              chave,
              titulo: curso.nome,
              eventos: [],
            });
          }
          mapa.get(chave)!.eventos.push(ev);
        });
      } else {
        // É um evento geral (sem curso)
        console.log(`Evento ${ev.cod} vai para GERAIS`);
        if (!mapa.has("GERAIS")) {
          mapa.set("GERAIS", {
            chave: "GERAIS",
            titulo: "Eventos Gerais",
            eventos: [],
          });
        }
        mapa.get("GERAIS")!.eventos.push(ev);
      }
    });

    // Ordena por título, mantendo GERAIS por último
    const grupos = Array.from(mapa.values()).sort((a, b) => {
      if (a.chave === "GERAIS") return 1;
      if (b.chave === "GERAIS") return -1;
      return a.titulo.localeCompare(b.titulo, "pt-BR");
    });

    console.log(
      "Grupos criados:",
      grupos.map((g) => ({
        chave: g.chave,
        titulo: g.titulo,
        eventos: g.eventos.length,
      }))
    );
    return grupos;
  };

  if (loading) {
    return (
      <div className="cronograma">
        <div className="container">
          <LoadingState
            title="Carregando Cronograma"
            message="Preparando a programação do seminário..."
            icon="event"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cronograma">
        <div className="container">
          <ErrorState message={error} onRetry={carregarDados} />
        </div>
      </div>
    );
  }

  const diasUnicos = obterDiasUnicos();

  return (
    <div className="cronograma">
      <div className="container">
        <div className="cronograma-header">
          <p>Programação acadêmica organizada por curso e horário</p>
        </div>

        {/* Filtros */}
        <div className="filtros-section">
          <div className="filtros-header">
            <h3>Filtros</h3>
            <button className="btn btn-secondary" onClick={limparFiltros}>
              <MaterialIcon
                name="clear"
                size="small"
                className="material-icon--animated"
              />
              Limpar Filtros
            </button>
          </div>

          <div className="filtros-grid">
            <div className="filtro-item">
              <label htmlFor="filtro-curso">Curso:</label>
              <select
                id="filtro-curso"
                name="curso"
                value={filtros.curso}
                onChange={(e) => handleFiltroChange("curso", e.target.value)}
                autoComplete="off"
              >
                <option value="">Todos</option>
                <option value="GERAL">Eventos Gerais</option>
                {cursos.map((curso) => (
                  <option key={curso._id} value={curso._id}>
                    {curso.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtro-tipoEvento">Tipo de Evento:</label>
              <select
                id="filtro-tipoEvento"
                name="tipoEvento"
                value={filtros.tipoEvento}
                onChange={(e) =>
                  handleFiltroChange("tipoEvento", e.target.value)
                }
                autoComplete="off"
              >
                <option value="">Todos</option>
                <option value="Palestra Principal">Palestra Principal</option>
                <option value="Apresentação de Trabalhos">
                  Apresentação de Trabalhos
                </option>
                <option value="Oficina">Oficina</option>
              </select>
            </div>
          </div>
        </div>

        {/* Controles de Visualização (apenas contador; lista detalhada removida) */}
        <div className="visualizacao-controls">
          <div style={{ flex: 1 }} />
          <div className="resultados-count">
            {(() => {
              // Conta eventos únicos (evita duplicação quando evento pertence a múltiplos cursos)
              const eventosUnicos = new Set();
              obterGruposPorCurso().forEach((grupo) => {
                grupo.eventos.forEach((evento) => {
                  eventosUnicos.add(evento._id);
                });
              });
              return eventosUnicos.size;
            })()}{" "}
            evento(s) encontrado(s)
          </div>
        </div>

        {/* Visualização em Grade de Horários */}
        <div className="grade-cronograma">
          {obterEventosParaVisualizacao().length === 0 ? (
            <div className="no-results">
              <MaterialIcon name="event_busy" size="large" />
              <p>Nenhum evento encontrado.</p>
            </div>
          ) : (
            <>
              {/* Navegação Mobile - Visível apenas em dispositivos móveis */}
              <div className="mobile-day-navigation">
                <div className="mobile-day-header">
                  <button
                    className="btn-nav-day"
                    onClick={() => navegarDia("anterior")}
                    disabled={obterDiasUnicos().indexOf(diaAtualMobile) === 0}
                  >
                    <MaterialIcon name="chevron_left" size="medium" />
                  </button>
                  <div className="mobile-day-info">
                    <h3>{formatarDiaCompleto(diaAtualMobile)}</h3>
                    <span className="mobile-day-counter">
                      {obterDiasUnicos().indexOf(diaAtualMobile) + 1} de{" "}
                      {obterDiasUnicos().length}
                    </span>
                  </div>
                  <button
                    className="btn-nav-day"
                    onClick={() => navegarDia("proximo")}
                    disabled={
                      obterDiasUnicos().indexOf(diaAtualMobile) ===
                      obterDiasUnicos().length - 1
                    }
                  >
                    <MaterialIcon name="chevron_right" size="medium" />
                  </button>
                </div>
              </div>

              {/* Visualização Desktop - Grade Completa */}
              <div className="desktop-view">
                {obterGruposPorCurso().map((grupo) => (
                  <div key={grupo.chave} style={{ marginBottom: 32 }}>
                    <div className="grade-info">
                      <h4>{grupo.titulo}</h4>
                      <div className="grade-stats">
                        {grupo.eventos.length} evento(s) |{" "}
                        {obterHorariosUnicos(grupo.eventos).length} horário(s)
                      </div>
                      <div className="grade-scroll-hint">
                        <MaterialIcon name="swipe" size="small" />
                        <span>
                          Deslize horizontalmente para ver todos os dias
                        </span>
                      </div>
                    </div>

                    <div className="grade-container">
                      <div
                        className="grade-header"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `120px repeat(${diasUnicos.length}, minmax(280px, 1fr))`,
                          gap: "2px",
                        }}
                      >
                        <div className="grade-cell grade-header-cell">
                          Horário
                        </div>
                        {diasUnicos.map((dia) => (
                          <div
                            key={`${grupo.chave}-${dia}`}
                            className="grade-cell grade-header-cell"
                          >
                            {formatarDataCurta(new Date(dia))}
                          </div>
                        ))}
                      </div>

                      {/* Grade principal com CSS Grid */}
                      <div
                        className="grade-main"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `120px repeat(${
                            obterDiasUnicos().length
                          }, minmax(280px, 1fr))`,
                          gridTemplateRows: `repeat(${
                            obterHorariosUnicos(grupo.eventos).length
                          }, 60px)`,
                          gap: "2px",
                        }}
                      >
                        {/* Células de horário */}
                        {obterHorariosUnicos(grupo.eventos).map(
                          (horario, rowIndex) => (
                            <div
                              key={`time-${horario}`}
                              className="grade-cell grade-time-cell"
                              style={{
                                gridColumn: 1,
                                gridRow: rowIndex + 1,
                              }}
                            >
                              <strong>{horario}</strong>
                            </div>
                          )
                        )}

                        {/* Células vazias dos dias */}
                        {diasUnicos.map((dia, colIndex) =>
                          obterHorariosUnicos(grupo.eventos).map(
                            (horario, rowIndex) => {
                              const eventosNaCelula = obterEventosPorDiaHorario(
                                dia,
                                horario,
                                grupo.eventos
                              );
                              const temEvento = eventosNaCelula.length > 0;

                              // Log para todos os eventos na grade para verificar seu posicionamento
                              if (eventosNaCelula.length > 0) {
                                eventosNaCelula.forEach((e) => {
                                  if (
                                    e.tema.includes("Relato de experiência") ||
                                    e.tema.includes("estágio")
                                  ) {
                                    console.log(
                                      `[DEBUG] Evento "${e.tema}" encontrado em ${horario}:`,
                                      {
                                        horarioSlot: horario,
                                        horarioEvento: `${e.hora.getHours()}:${e.hora
                                          .getMinutes()
                                          .toString()
                                          .padStart(2, "0")}`,
                                        duracao: e.duracao || 60,
                                        id: e._id,
                                      }
                                    );
                                  }
                                });
                              }
                              return (
                                <div
                                  key={`empty-${dia}-${horario}`}
                                  className={`grade-cell grade-event-cell ${
                                    temEvento
                                      ? "grade-cell-occupied"
                                      : "grade-cell-empty"
                                  }`}
                                  style={{
                                    gridColumn: colIndex + 2,
                                    gridRow: rowIndex + 1,
                                  }}
                                >
                                  {!temEvento && (
                                    <div className="evento-vazio">-</div>
                                  )}
                                </div>
                              );
                            }
                          )
                        )}

                        {/* Eventos posicionados no grid */}
                        {(() => {
                          const eventosRenderizados = new Set();
                          const eventosSimultaneos = new Map();

                          // Detectar eventos simultâneos (que se sobrepõem no tempo)
                          const eventosDoGrupo = grupo.eventos;

                          // Para cada dia e coluna
                          obterDiasUnicos().forEach((dia, colIndex) => {
                            // Pegar todos os eventos do dia
                            const eventosDoDia = eventosDoGrupo.filter(
                              (evento) => evento.data.toDateString() === dia
                            );

                            // Detectar sobreposições por algoritmo de overlapping intervals
                            const eventosProcessados = new Set();

                            eventosDoDia.forEach((evento) => {
                              if (eventosProcessados.has(evento._id)) return;

                              // Calcular início e fim deste evento
                              // Obter horas e minutos diretamente para evitar problemas de fuso
                              const eventoHora = evento.hora.getHours();
                              const eventoMinuto = evento.hora.getMinutes();
                              const inicioEvento =
                                eventoHora * 60 + eventoMinuto;
                              const fimEvento =
                                inicioEvento + (evento.duracao || 60);

                              // Encontrar todos os eventos que se sobrepõem com este
                              const eventosSimultaneosGrupo = [evento];

                              eventosDoDia.forEach((outroEvento) => {
                                if (
                                  outroEvento._id === evento._id ||
                                  eventosProcessados.has(outroEvento._id)
                                )
                                  return;

                                // Obter horas e minutos diretamente para evitar problemas de fuso
                                const outroHora = outroEvento.hora.getHours();
                                const outroMinuto =
                                  outroEvento.hora.getMinutes();
                                const inicioOutro =
                                  outroHora * 60 + outroMinuto;
                                const fimOutro =
                                  inicioOutro + (outroEvento.duracao || 60);

                                // Verifica se há sobreposição: início1 < fim2 && início2 < fim1
                                if (
                                  inicioEvento < fimOutro &&
                                  inicioOutro < fimEvento
                                ) {
                                  eventosSimultaneosGrupo.push(outroEvento);
                                  eventosProcessados.add(outroEvento._id);
                                }
                              });

                              // Ordenar por prioridade (Palestra Principal primeiro)
                              eventosSimultaneosGrupo.sort((a, b) => {
                                if (
                                  a.tipoEvento === "Palestra Principal" &&
                                  b.tipoEvento !== "Palestra Principal"
                                )
                                  return -1;
                                if (
                                  b.tipoEvento === "Palestra Principal" &&
                                  a.tipoEvento !== "Palestra Principal"
                                )
                                  return 1;
                                return a.hora.getTime() - b.hora.getTime();
                              });

                              // Usar o evento com menor horário de início como chave
                              const eventoBase = eventosSimultaneosGrupo[0];
                              // Obter horas e minutos diretamente
                              const horaBase = eventoBase.hora.getHours();
                              const minutoBase = eventoBase.hora.getMinutes();
                              const horarioBase = `${horaBase}:${minutoBase
                                .toString()
                                .padStart(2, "0")}`;
                              const key = `${dia}-${horarioBase}`;

                              if (!eventosSimultaneos.has(key)) {
                                eventosSimultaneos.set(key, {
                                  dia,
                                  horario: horarioBase,
                                  eventos: eventosSimultaneosGrupo,
                                  colIndex,
                                });
                              }

                              eventosSimultaneosGrupo.forEach((e) => {
                                eventosRenderizados.add(e._id);
                                eventosProcessados.add(e._id);
                              });
                            });
                          });

                          return Array.from(eventosSimultaneos.values()).map(
                            ({
                              dia,
                              horario,
                              eventos: eventosGrupo,
                              colIndex,
                            }) => {
                              const horariosGrupo = obterHorariosUnicos(
                                grupo.eventos
                              );
                              // Para eventos simultâneos, calcular a altura do container baseada no maior evento
                              const duracaoMaxima = Math.max(
                                ...eventosGrupo.map(
                                  (e: Evento) => e.duracao || 60
                                )
                              );
                              const eventoMaiorDuracao =
                                eventosGrupo.find(
                                  (e: Evento) =>
                                    (e.duracao || 60) === duracaoMaxima
                                ) || eventosGrupo[0];
                              const slotsVisuaisContainer =
                                calcularSlotsVisuais(eventoMaiorDuracao);
                              const diasTotal = obterDiasUnicos().length;

                              // Encontrar o índice da linha inicial
                              const startRowIndex =
                                horariosGrupo.indexOf(horario);

                              return (
                                <div
                                  key={`simult-${dia}-${horario}`}
                                  className="eventos-simultaneos-container"
                                  style={{
                                    gridColumn: colIndex + 2,
                                    gridRow: `${
                                      startRowIndex + 1
                                    } / span ${slotsVisuaisContainer}`,
                                    display: "flex",
                                    gap: "2px",
                                    height: "100%",
                                  }}
                                >
                                  {eventosGrupo.map((evento: Evento) => {
                                    const slotsOcupados =
                                      calcularSlotsOcupados(evento);
                                    const duracaoEvento = evento.duracao || 60;

                                    // Calcular altura proporcional baseada na duração do evento vs duração máxima
                                    const alturaProporcia =
                                      (duracaoEvento / duracaoMaxima) * 100;

                                    return (
                                      <div
                                        key={evento._id}
                                        className={`${obterClasseCard(
                                          evento,
                                          slotsOcupados,
                                          diasTotal
                                        )} evento-grade-grid evento-simultaneo`}
                                        onClick={() => abrirDetalhes(evento)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" ||
                                            e.key === " "
                                          )
                                            abrirDetalhes(evento);
                                        }}
                                        style={{
                                          flex: 1,
                                          height: `${alturaProporcia}%`,
                                          alignSelf: "flex-start",
                                        }}
                                      >
                                        <div
                                          className="evento-grade-tema"
                                          title={evento.tema}
                                        >
                                          {evento.tema}
                                        </div>

                                        <div className="evento-grade-info">
                                          <div
                                            className="evento-grade-local"
                                            title={evento.sala}
                                          >
                                            <MaterialIcon
                                              name="location_on"
                                              size="small"
                                            />
                                            <span>{evento.sala}</span>
                                          </div>
                                          {(slotsOcupados > 2 ||
                                            diasTotal <= 2) && (
                                            <div
                                              className="evento-grade-palestrante"
                                              title={
                                                evento.palestrante ||
                                                evento.autores[0]
                                              }
                                            >
                                              <MaterialIcon
                                                name="person"
                                                size="small"
                                              />
                                              <span>
                                                {evento.palestrante ||
                                                  evento.autores[0]}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        <div className="evento-grade-tipo">
                                          {evento.tipoEvento}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visualização Mobile - Um Dia por Vez */}
              <div className="mobile-view">
                {obterGruposPorCurso().map((grupo) => {
                  const eventosDoDia = grupo.eventos.filter(
                    (evento) => evento.data.toDateString() === diaAtualMobile
                  );

                  if (eventosDoDia.length === 0) return null;

                  return (
                    <div key={grupo.chave} className="mobile-grupo">
                      <div className="mobile-grupo-header">
                        <h4>{grupo.titulo}</h4>
                        <span className="mobile-grupo-count">
                          {eventosDoDia.length} evento(s)
                        </span>
                      </div>

                      <div className="mobile-eventos-lista">
                        {eventosDoDia
                          .sort((a, b) => a.hora.getTime() - b.hora.getTime())
                          .map((evento) => (
                            <div
                              key={evento._id}
                              className={`mobile-evento-card ${evento.tipoEvento
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                              onClick={() => abrirDetalhes(evento)}
                            >
                              <div className="mobile-evento-header">
                                <div className="mobile-evento-hora">
                                  {evento.hora.toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>

                              <div className="mobile-evento-titulo">
                                {evento.tema}
                              </div>

                              <div className="mobile-evento-info">
                                <div className="mobile-evento-local">
                                  <MaterialIcon
                                    name="location_on"
                                    size="small"
                                  />
                                  {evento.sala}
                                </div>
                                <div className="mobile-evento-tipo">
                                  {evento.tipoEvento}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal de Detalhes do Evento */}
        <Modal
          isOpen={mostrarDetalhes}
          onClose={fecharDetalhes}
          title=""
          size="large"
        >
          {eventoSelecionado && (
            <div className="evento-detalhes-modal">
              {/* Hero Section */}
              <div className="evento-hero">
                <div className="evento-hero-background">
                  <div className="evento-hero-content">
                    <div className="evento-meta">
                      <span className="evento-codigo-hero">
                        #{eventoSelecionado.cod}
                      </span>
                      <span
                        className={`evento-tipo-badge ${eventoSelecionado.tipoEvento
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {eventoSelecionado.tipoEvento}
                      </span>
                    </div>

                    <h2 className="evento-titulo-hero">
                      {eventoSelecionado.tema}
                    </h2>

                    <div className="evento-curso-hero">
                      {(() => {
                        const cursosEvento: any[] = Array.isArray(
                          (eventoSelecionado as any).cursos
                        )
                          ? (eventoSelecionado as any).cursos
                          : eventoSelecionado.curso
                          ? [eventoSelecionado.curso]
                          : [];
                        if (cursosEvento.length === 0) {
                          return (
                            <>
                              <MaterialIcon name="public" size="small" />
                              <span>Evento Geral</span>
                            </>
                          );
                        }
                        const nomes = cursosEvento.map((c: any) =>
                          typeof c === "object"
                            ? c.nome
                            : cursos.find((cc) => cc._id === c)?.nome || "Curso"
                        );
                        return (
                          <>
                            <MaterialIcon name="school" size="small" />
                            <span>{nomes.join(", ")}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="evento-hero-decoracao">
                    <div className="decoracao-circle"></div>
                    <div className="decoracao-lines"></div>
                  </div>
                </div>
              </div>

              {/* Área de Conteúdo Scrollável */}
              <div className="evento-content-area">
                {/* Informações Principais */}
                <div className="evento-info-cards">
                  <div className="info-card destaque">
                    <div className="info-card-icon">
                      <MaterialIcon name="schedule" size="large" />
                    </div>
                    <div className="info-card-content">
                      <h3>Quando</h3>
                      <p className="data-completa">
                        {new Date(eventoSelecionado.data).toLocaleDateString(
                          "pt-BR",
                          {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <div className="horario-duracao">
                        <span className="horario">
                          {new Date(eventoSelecionado.hora).toLocaleTimeString(
                            "pt-BR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        <span className="separador">•</span>
                        <span className="duracao">
                          {eventoSelecionado.duracao || 60} minutos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card-icon">
                      <MaterialIcon name="place" size="large" />
                    </div>
                    <div className="info-card-content">
                      <h3>Local</h3>
                      <p className="local-nome">{eventoSelecionado.sala}</p>
                      {(() => {
                        const detalhesLocal = obterDetalhesLocal(
                          eventoSelecionado.sala
                        );
                        if (detalhesLocal && detalhesLocal.descricao) {
                          return (
                            <p className="local-descricao">
                              {detalhesLocal.descricao}
                            </p>
                          );
                        } else {
                          return (
                            <p className="local-instrucao">
                              Consulte a sinalização do campus
                            </p>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                {/* Participantes */}
                <div className="evento-secao">
                  <div className="secao-titulo">
                    <MaterialIcon name="people" size="medium" />
                    <h3>Participantes</h3>
                  </div>

                  <div className="participantes-grid">
                    {eventoSelecionado.tipoEvento === "Palestra Principal" ? (
                      <div className="participante-destaque palestrante">
                        <div className="participante-avatar">
                          <MaterialIcon name="mic" size="large" />
                        </div>
                        <div className="participante-info">
                          <span className="participante-role">
                            Palestrante Principal
                          </span>
                          <h4 className="participante-nome">
                            {eventoSelecionado.palestrante}
                          </h4>
                          <div className="participante-badge especialista">
                            <MaterialIcon name="star" size="small" />
                            Especialista
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {eventoSelecionado.autores &&
                          eventoSelecionado.autores.length > 0 && (
                            <div className="participante-grupo">
                              <div className="grupo-header">
                                <MaterialIcon name="group" size="medium" />
                                <span className="grupo-titulo">
                                  {eventoSelecionado.autores.length === 1
                                    ? "Autor"
                                    : "Autores"}
                                </span>
                              </div>
                              <div className="autores-lista">
                                {eventoSelecionado.autores.map(
                                  (autor, index) => (
                                    <div key={index} className="autor-item">
                                      <div className="autor-avatar">
                                        <MaterialIcon
                                          name="person"
                                          size="medium"
                                        />
                                      </div>
                                      <span className="autor-nome">
                                        {autor}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {eventoSelecionado.orientador && (
                          <div className="participante-destaque orientador">
                            <div className="participante-avatar">
                              <MaterialIcon
                                name="supervisor_account"
                                size="large"
                              />
                            </div>
                            <div className="participante-info">
                              <span className="participante-role">
                                Orientador
                              </span>
                              <h4 className="participante-nome">
                                {eventoSelecionado.orientador}
                              </h4>
                              <div className="participante-badge professor">
                                <MaterialIcon name="school" size="small" />
                                Professor
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Resumo */}
                {eventoSelecionado.resumo && (
                  <div className="evento-secao">
                    <div className="secao-titulo">
                      <MaterialIcon name="description" size="medium" />
                      <h3>Resumo</h3>
                    </div>

                    <div className="resumo-container">
                      <div className="resumo-texto">
                        <p>{eventoSelecionado.resumo}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="evento-footer">
                <div className="footer-info">
                  <MaterialIcon name="info" size="small" />
                  <span>
                    Para mais informações, consulte a coordenação do seminário
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Cronograma;
