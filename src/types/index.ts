export interface Local {
  _id?: string;
  cod: string;
  nome: string;
  capacidade: number;
  tipoLocal: 'Sala de Aula' | 'Biblioteca' | 'Laboratório' | 'Auditório' | 'Anfiteatro' | 'Pátio' | 'Quadra' | 'Espaço';
  descricao?: string;
}

export interface Curso {
  _id?: string;
  cod: string;
  nome: string;
}

export interface Evento {
  _id?: string;
  cod?: string; // Código será gerado automaticamente
  data: Date;
  hora: Date;
  duracao?: number; // Duração em minutos
  tema: string;
  autores: string[]; // Array de autores
  palestrante?: string; // Apenas para Palestra Principal
  orientador?: string; // Para outros tipos de evento
  sala: string;
  tipoEvento: 'Palestra Principal' | 'Apresentação de Trabalhos' | 'Oficina' | 'Banner';
  // Novo: vários cursos por evento; se ausente/vazio, o evento é geral
  cursos?: Array<string | Curso>;
  // Legado: campo antigo de curso único (mantido para compatibilidade de leitura)
  curso?: string | Curso;
  resumo?: string;
}

export interface Permissao {
  _id?: string;
  nome: string;
  codigo: string;
  modulo: string;
  descricao?: string;
  ativo: boolean;
}

export interface Perfil {
  _id?: string;
  nome: string;
  descricao?: string;
  permissoes: string[]; // Array de IDs das permissões
  ativo: boolean;
}

export interface Usuario {
  _id?: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: string | Perfil; // ID do perfil ou objeto perfil populado
  curso?: string;
  ativo: boolean;
  ultimoLogin?: Date;
  tokenExpiracao?: Date;
}

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
  permissoes: string[];
}

export interface Inscricao {
  _id?: string;
  usuarioId: string;
  eventoId: string;
  dataInscricao: Date;
  presente?: boolean;
}

export interface CheckIn {
  _id?: string;
  usuarioId: string;
  eventoId: string;
  dataCheckIn: Date;
  qrCode: string;
}

export interface Avaliacao {
  _id?: string;
  usuarioId: string;
  eventoId: string;
  nota: number;
  comentario?: string;
  dataAvaliacao: Date;
}
