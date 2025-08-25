import { Evento, Curso, Local, Usuario, Perfil, Permissao } from '../types';
import { API_BASE_URL } from '../config/api';

export interface LoginData {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      nome: string;
      email: string;
      perfil: any;
      permissoes: string[];
    };
    token: string;
    expiresAt: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Interceptor para adicionar token nas requisições
const createApiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
};

// Cliente de API genérico
export const api = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await createApiCall(url);
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição GET:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async post<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await createApiCall(url, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição POST:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async put<T>(url: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await createApiCall(url, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição PUT:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await createApiCall(url, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Erro na requisição DELETE:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },
};

export const authService = {
  async login(loginData: LoginData): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no login:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    return api.post('/auth/logout', {});
  },

  async verify(): Promise<ApiResponse<any>> {
    return api.get('/auth/verify');
  },
};

export const eventoService = {
  async listarEventos(filtros?: {
    page?: number;
    limit?: number;
    tipoEvento?: string;
    data?: string;
    search?: string;
    local?: string;
    curso?: string;
  }): Promise<ApiResponse<Evento[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `/eventos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return api.get(url);
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async buscarEventoPorId(id: string): Promise<ApiResponse<Evento>> {
    return api.get(`/eventos/${id}`);
  },

  async criarEvento(evento: Omit<Evento, '_id'>): Promise<ApiResponse<Evento>> {
    return api.post('/eventos', evento);
  },

  async atualizarEvento(id: string, evento: Partial<Evento>): Promise<ApiResponse<Evento>> {
    return api.put(`/eventos/${id}`, evento);
  },

  async deletarEvento(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/eventos/${id}`);
  },

  async obterEstatisticas(): Promise<ApiResponse<any>> {
    return api.get('/eventos/estatisticas');
  },

  async obterCronograma(data: string): Promise<ApiResponse<Evento[]>> {
    return api.get(`/eventos/cronograma?data=${data}`);
  },
};

export const localService = {
  async listarLocais(filtros?: {
    page?: number;
    limit?: number;
    tipoLocal?: string;
    capacidadeMin?: number;
    search?: string;
  }): Promise<ApiResponse<Local[]>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `/locais${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return api.get(url);
    } catch (error) {
      console.error('Erro ao listar locais:', error);
      return {
        success: false,
        message: 'Erro de conexão com o servidor',
      };
    }
  },

  async buscarLocalPorId(id: string): Promise<ApiResponse<Local>> {
    return api.get(`/locais/${id}`);
  },

  async gerarCodigo(tipoLocal: string): Promise<ApiResponse<{ codigo: string }>> {
    return api.get(`/locais/gerar-codigo/${encodeURIComponent(tipoLocal)}`);
  },

  async criarLocal(local: Omit<Local, '_id' | 'cod'>): Promise<ApiResponse<Local>> {
    return api.post('/locais', local);
  },

  async atualizarLocal(id: string, local: Partial<Local>): Promise<ApiResponse<Local>> {
    return api.put(`/locais/${id}`, local);
  },

  async deletarLocal(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/locais/${id}`);
  },

  async obterEstatisticas(): Promise<ApiResponse<any>> {
    return api.get('/locais/estatisticas');
  },

  async listarLocaisComEventos(): Promise<ApiResponse<string[]>> {
    return api.get('/locais?comEventos=true');
  },
};

export const cursoService = {
  async listarCursos(filtros?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    modalidade?: string;
  }): Promise<ApiResponse<Curso[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filtros) {
        Object.entries(filtros).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      const url = `/cursos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return api.get(url);
    } catch (error) {
      console.error('Erro ao listar cursos:', error);
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  },

  async buscarCursoPorId(id: string): Promise<ApiResponse<Curso>> {
    return api.get(`/cursos/${id}`);
  },

  async criarCurso(curso: Pick<Curso, 'nome'>): Promise<ApiResponse<Curso>> {
    return api.post('/cursos', { nome: curso.nome });
  },

  async atualizarCurso(id: string, curso: Partial<Curso>): Promise<ApiResponse<Curso>> {
    return api.put(`/cursos/${id}`, curso);
  },

  async deletarCurso(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/cursos/${id}`);
  },
};

// Novos serviços para usuários, perfis e permissões
export const usuarioService = {
  async listarUsuarios(): Promise<ApiResponse<Usuario[]>> {
    return api.get('/usuarios');
  },

  async obterUsuario(id: string): Promise<ApiResponse<Usuario>> {
    return api.get(`/usuarios/${id}`);
  },

  async criarUsuario(usuario: Omit<Usuario, '_id'>): Promise<ApiResponse<Usuario>> {
    return api.post('/usuarios', usuario);
  },

  async atualizarUsuario(id: string, usuario: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    return api.put(`/usuarios/${id}`, usuario);
  },

  async excluirUsuario(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/usuarios/${id}`);
  },

  async alterarSenha(id: string, senhas: { senhaAtual: string; novaSenha: string }): Promise<ApiResponse<null>> {
    return api.put(`/usuarios/${id}/senha`, senhas);
  },
};

export const perfilService = {
  async listarPerfis(): Promise<ApiResponse<Perfil[]>> {
    return api.get('/perfis');
  },

  async obterPerfil(id: string): Promise<ApiResponse<Perfil>> {
    return api.get(`/perfis/${id}`);
  },

  async criarPerfil(perfil: Omit<Perfil, '_id'>): Promise<ApiResponse<Perfil>> {
    return api.post('/perfis', perfil);
  },

  async atualizarPerfil(id: string, perfil: Partial<Perfil>): Promise<ApiResponse<Perfil>> {
    return api.put(`/perfis/${id}`, perfil);
  },

  async excluirPerfil(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/perfis/${id}`);
  },

  async adicionarPermissoes(id: string, permissoes: string[]): Promise<ApiResponse<Perfil>> {
    return api.post(`/perfis/${id}/permissoes`, { permissoes });
  },

  async removerPermissoes(id: string, permissoes: string[]): Promise<ApiResponse<Perfil>> {
    // Note: As permissões a serem removidas devem ser enviadas no body da requisição
    return api.post(`/perfis/${id}/permissoes/remover`, { permissoes });
  },
};

export const permissaoService = {
  async listarPermissoes(): Promise<ApiResponse<Permissao[]>> {
    return api.get('/permissoes');
  },

  async listarPermissoesPorModulo(): Promise<ApiResponse<any>> {
    return api.get('/permissoes/modulos');
  },

  async obterPermissao(id: string): Promise<ApiResponse<Permissao>> {
    return api.get(`/permissoes/${id}`);
  },

  async criarPermissao(permissao: Omit<Permissao, '_id'>): Promise<ApiResponse<Permissao>> {
    return api.post('/permissoes', permissao);
  },

  async atualizarPermissao(id: string, permissao: Partial<Permissao>): Promise<ApiResponse<Permissao>> {
    return api.put(`/permissoes/${id}`, permissao);
  },

  async excluirPermissao(id: string): Promise<ApiResponse<null>> {
    return api.delete(`/permissoes/${id}`);
  },
};

export default authService;
