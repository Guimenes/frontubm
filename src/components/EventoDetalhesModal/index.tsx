import React, { useState } from "react";
import ReactDOM from "react-dom";
import MaterialIcon from "../MaterialIcon";
import { Evento, Curso, Local } from "../../types";
import "./styles.css";

const ModalMarkup = ({
  onClose,
  evento,
  cursos,
  locais,
  onEditar,
  onExcluir,
  onInscrever,
  onCompartilhar,
  isInscrito,
  isFavorito,
  onToggleFavorito,
}: any) => {
  const [activeTab, setActiveTab] = useState<"detalhes" | "resumo" | "autores">(
    "detalhes"
  );

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatarHora = (hora: Date) => {
    return new Date(hora).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatarDuracao = (duracao?: number) => {
    if (!duracao) return "Não informado";
    const horas = Math.floor(duracao / 60);
    const minutos = duracao % 60;
    if (horas > 0) {
      return `${horas}h${minutos > 0 ? ` ${minutos}min` : ""}`;
    }
    return `${minutos} min`;
  };

  const obterNomeCurso = (cursoId: string) => {
    const curso = cursos.find((c: Curso) => c._id === cursoId || c.cod === cursoId);
    return curso?.nome || cursoId;
  };

  const obterNomeLocal = (localId: string) => {
    const local = locais.find((l: Local) => l._id === localId || l.cod === localId);
    return local?.nome || localId;
  };

  const obterTipoEventoIcon = (tipo: string) => {
    switch (tipo) {
      case "Palestra Principal":
        return "mic";
      case "Apresentação de Trabalhos":
        return "school";
      case "Oficina":
        return "build";
      case "Banner":
        return "image";
      default:
        return "event";
    }
  };

  const obterCorTipoEvento = (tipo: string) => {
    switch (tipo) {
      case "Palestra Principal":
        return "#8b1538";
      case "Apresentação de Trabalhos":
        return "#1565c0";
      case "Oficina":
        return "#2e7d32";
      case "Banner":
        return "#f57c00";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="evento-detalhes-overlay" aria-modal="true" role="dialog">
      <div className="evento-detalhes-content">
        {/* Header */}
        <div className="evento-detalhes-header">
          <div className="evento-detalhes-header-content">
            <div
              className="evento-detalhes-icon"
              style={{ backgroundColor: obterCorTipoEvento(evento.tipoEvento) }}
            >
              <MaterialIcon name={obterTipoEventoIcon(evento.tipoEvento)} />
            </div>
            <div className="evento-detalhes-title-area">
              <h2 className="evento-detalhes-title">{evento.tema}</h2>
              <div className="evento-detalhes-metadata">
                <span
                  className="evento-tipo-badge"
                  style={{
                    backgroundColor: obterCorTipoEvento(evento.tipoEvento),
                  }}
                >
                  {evento.tipoEvento}
                </span>
                {evento.cod && (
                  <span className="evento-codigo">#{evento.cod}</span>
                )}
              </div>
            </div>
          </div>
          <div className="evento-detalhes-header-actions">
            {onToggleFavorito && (
              <button
                className={`evento-action-btn ${isFavorito ? "favorito" : ""}`}
                onClick={() => onToggleFavorito(evento)}
                title={
                  isFavorito
                    ? "Remover dos favoritos"
                    : "Adicionar aos favoritos"
                }
              >
                <MaterialIcon
                  name={isFavorito ? "favorite" : "favorite_border"}
                />
              </button>
            )}
            {onCompartilhar && (
              <button
                className="evento-action-btn"
                onClick={() => onCompartilhar(evento)}
                title="Compartilhar evento"
              >
                <MaterialIcon name="share" />
              </button>
            )}
            <button
              className="evento-close-btn"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <MaterialIcon name="close" />
            </button>
          </div>
        </div>

        {/* Informações principais */}
        <div className="evento-info-cards">
          <div className="evento-info-card">
            <MaterialIcon name="schedule" />
            <div>
              <span className="evento-info-label">Data e Hora</span>
              <span className="evento-info-value">
                {formatarData(evento.data)} às {formatarHora(evento.hora)}
              </span>
            </div>
          </div>

          <div className="evento-info-card">
            <MaterialIcon name="timer" />
            <div>
              <span className="evento-info-label">Duração</span>
              <span className="evento-info-value">
                {formatarDuracao(evento.duracao)}
              </span>
            </div>
          </div>

          <div className="evento-info-card">
            <MaterialIcon name="place" />
            <div>
              <span className="evento-info-label">Local</span>
              <span className="evento-info-value">
                {obterNomeLocal(evento.sala)}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="evento-tabs">
          <button
            className={`evento-tab ${activeTab === "detalhes" ? "active" : ""}`}
            onClick={() => setActiveTab("detalhes")}
          >
            <MaterialIcon name="info" />
            Detalhes
          </button>
          {evento.resumo && (
            <button
              className={`evento-tab ${activeTab === "resumo" ? "active" : ""}`}
              onClick={() => setActiveTab("resumo")}
            >
              <MaterialIcon name="description" />
              Resumo
            </button>
          )}
          <button
            className={`evento-tab ${activeTab === "autores" ? "active" : ""}`}
            onClick={() => setActiveTab("autores")}
          >
            <MaterialIcon name="people" />
            Participantes
          </button>
        </div>

        {/* Conteúdo das tabs */}
        <div className="evento-tab-content">
          {activeTab === "detalhes" && (
            <div className="evento-detalhes-section">
              <div className="evento-details-grid">
                {evento.palestrante && (
                  <div className="evento-detail-item">
                    <span className="evento-detail-label">
                      <MaterialIcon name="person" />
                      Palestrante
                    </span>
                    <span className="evento-detail-value">
                      {evento.palestrante}
                    </span>
                  </div>
                )}

                {evento.orientador && (
                  <div className="evento-detail-item">
                    <span className="evento-detail-label">
                      <MaterialIcon name="supervisor_account" />
                      Orientador
                    </span>
                    <span className="evento-detail-value">
                      {evento.orientador}
                    </span>
                  </div>
                )}

                {(evento.cursos?.length || evento.curso) && (
                  <div className="evento-detail-item full-width">
                    <span className="evento-detail-label">
                      <MaterialIcon name="school" />
                      {evento.cursos?.length ? "Cursos" : "Curso"}
                    </span>
                    <div className="evento-cursos-tags">
                      {evento.cursos?.length ? (
                        evento.cursos.map((curso: string | Curso, index: number) => (
                          <span key={index} className="evento-curso-tag">
                            {typeof curso === "string"
                              ? obterNomeCurso(curso)
                              : curso.nome}
                          </span>
                        ))
                      ) : evento.curso ? (
                        <span className="evento-curso-tag">
                          {typeof evento.curso === "string"
                            ? obterNomeCurso(evento.curso)
                            : evento.curso.nome}
                        </span>
                      ) : (
                        <span className="evento-curso-geral">Evento Geral</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "resumo" && evento.resumo && (
            <div className="evento-resumo-section">
              <div className="evento-resumo-content">
                <p>{evento.resumo}</p>
              </div>
            </div>
          )}

          {activeTab === "autores" && (
            <div className="evento-autores-section">
              <div className="evento-autores-list">
                {evento.autores.map((autor: string, index: number) => (
                  <div key={index} className="evento-autor-item">
                    <div className="evento-autor-avatar">
                      <MaterialIcon name="person" />
                    </div>
                    <div className="evento-autor-info">
                      <span className="evento-autor-nome">{autor}</span>
                      <span className="evento-autor-papel">Autor</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="evento-detalhes-footer">
          <div className="evento-footer-actions">
            {onInscrever && (
              <button
                className={`btn btn-primary ${isInscrito ? "inscrito" : ""}`}
                onClick={() => onInscrever(evento)}
                disabled={isInscrito}
              >
                <MaterialIcon
                  name={isInscrito ? "check_circle" : "person_add"}
                />
                {isInscrito ? "Inscrito" : "Inscrever-se"}
              </button>
            )}

            {onEditar && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  onEditar(evento);
                  onClose();
                }}
              >
                <MaterialIcon name="edit" />
                Editar
              </button>
            )}

            {onExcluir && (
              <button
                className="btn btn-danger"
                onClick={() => onExcluir(evento)}
              >
                <MaterialIcon name="delete" />
                Excluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EventoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento: Evento | null;
  cursos?: Curso[];
  locais?: Local[];
  onEditar?: (evento: Evento) => void;
  onExcluir?: (evento: Evento) => void;
  onInscrever?: (evento: Evento) => void;
  onCompartilhar?: (evento: Evento) => void;
  isInscrito?: boolean;
  isFavorito?: boolean;
  onToggleFavorito?: (evento: Evento) => void;
}

const EventoDetalhesModal: React.FC<EventoDetalhesModalProps> = ({
  isOpen,
  onClose,
  evento,
  cursos = [],
  locais = [],
  onEditar,
  onExcluir,
  onInscrever,
  onCompartilhar,
  isInscrito = false,
  isFavorito = false,
  onToggleFavorito,
}) => {
  // Bloqueia scroll do body quando modal está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add("evento-detalhes-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("evento-detalhes-open");
      document.body.style.overflow = "";
    }

    return () => {
      document.body.classList.remove("evento-detalhes-open");
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !evento) return null;

  return ReactDOM.createPortal(
    <ModalMarkup
      onClose={onClose}
      evento={evento}
      cursos={cursos}
      locais={locais}
      onEditar={onEditar}
      onExcluir={onExcluir}
      onInscrever={onInscrever}
      onCompartilhar={onCompartilhar}
      isInscrito={isInscrito}
      isFavorito={isFavorito}
      onToggleFavorito={onToggleFavorito}
    />,
    document.body
  );
};

export default EventoDetalhesModal;
