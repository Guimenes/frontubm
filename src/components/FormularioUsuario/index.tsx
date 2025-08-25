import { useState, useEffect } from 'react';
import { Usuario, Perfil } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface FormularioUsuarioProps {
  usuarioParaEditar?: Usuario | null;
  onSalvar: () => void;
  onCancelar: () => void;
  onSucesso?: (titulo: string, mensagem?: string) => void;
  onErro?: (titulo: string, mensagem?: string) => void;
}

const FormularioUsuario = ({ 
  usuarioParaEditar, 
  onSalvar, 
  onCancelar,
  onSucesso,
  onErro
}: FormularioUsuarioProps) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmaSenha: '',
    perfil: '',
    ativo: true
  });
  
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEdicao = !!usuarioParaEditar;

  useEffect(() => {
    carregarDados();
    
    if (usuarioParaEditar) {
      setFormData({
        nome: usuarioParaEditar.nome,
        email: usuarioParaEditar.email,
        senha: '',
        confirmaSenha: '',
        perfil: typeof usuarioParaEditar.perfil === 'string' 
          ? usuarioParaEditar.perfil 
          : usuarioParaEditar.perfil._id || '',
        ativo: usuarioParaEditar.ativo
      });
    }
  }, [usuarioParaEditar]);

  const carregarDados = async () => {
    try {
      const perfisResponse = await api.get('/perfis');

      if (perfisResponse.success && Array.isArray(perfisResponse.data)) {
        setPerfis(perfisResponse.data.filter((p: Perfil) => p.ativo));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const validarFormulario = (): boolean => {
    const novosErrors: Record<string, string> = {};

    // Validar nome
    if (!formData.nome.trim()) {
      novosErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      novosErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      novosErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      novosErrors.email = 'Email inválido';
    }

    // Validar senha (obrigatória apenas na criação)
    if (!isEdicao) {
      if (!formData.senha) {
        novosErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 6) {
        novosErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
      }
    } else if (formData.senha && formData.senha.length < 6) {
      novosErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (formData.senha && formData.senha !== formData.confirmaSenha) {
      novosErrors.confirmaSenha = 'Senhas não coincidem';
    }

    // Validar perfil
    if (!formData.perfil) {
      novosErrors.perfil = 'Perfil é obrigatório';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const url = isEdicao ? `/usuarios/${usuarioParaEditar!._id}` : '/usuarios';
      const method = isEdicao ? 'put' : 'post';
      
      const dataToSend: any = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        perfil: formData.perfil
      };

      // Para criação, incluir a senha e definir como ativo
      if (!isEdicao) {
        if (formData.senha) {
          dataToSend.senha = formData.senha;
        }
        dataToSend.ativo = true; // Novos usuários sempre começam ativos
      }

      // Atualizar dados básicos do usuário
      const response = await api[method](url, dataToSend);

      if (response.success) {
        // Se é edição e há uma nova senha, fazer uma chamada separada para alterar a senha
        if (isEdicao && formData.senha) {
          try {
            await api.put(`/usuarios/${usuarioParaEditar!._id}/senha`, {
              novaSenha: formData.senha
            });
          } catch (senhaError: any) {
            console.error('Erro ao atualizar senha:', senhaError);
            // Se falhar ao atualizar senha, mostrar erro mas continuar
            if (onErro) {
              onErro('Erro ao Atualizar Senha', 'Dados básicos salvos, mas houve erro ao atualizar a senha');
            }
            return;
          }
        }

        const titulo = isEdicao ? 'Usuário Atualizado!' : 'Usuário Criado!';
        const mensagem = response.message || (isEdicao ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
        
        // Se o usuário editado é o próprio usuário logado, atualizar o contexto
        if (isEdicao && user && usuarioParaEditar && user.id === usuarioParaEditar._id) {
          const updatedUser = {
            ...user,
            nome: formData.nome,
            email: formData.email
          };
          updateUser(updatedUser);
        }
        
        if (onSucesso) {
          onSucesso(titulo, mensagem);
        }
        
        onSalvar();
      }
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        const message = error.response?.data?.message || 'Erro ao salvar usuário';
        
        if (onErro) {
          onErro('Erro ao Salvar', message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-usuario">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="nome" className="required">
            <MaterialIcon name="person" />
            Nome
          </label>
          <input
            type="text"
            id="nome"
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className={errors.nome ? 'error' : ''}
            placeholder="Digite o nome completo"
            disabled={loading}
          />
          {errors.nome && <span className="error-message">{errors.nome}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email" className="required">
            <MaterialIcon name="email" />
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'error' : ''}
            placeholder="Digite o email"
            disabled={loading}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="senha" className={!isEdicao ? 'required' : ''}>
            <MaterialIcon name="lock" />
            {isEdicao ? 'Nova Senha (opcional)' : 'Senha'}
          </label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="senha"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              className={errors.senha ? 'error' : ''}
              placeholder={isEdicao ? 'Deixe vazio para manter a atual' : 'Digite a senha'}
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} />
            </button>
          </div>
          {errors.senha && <span className="error-message">{errors.senha}</span>}
        </div>

        {formData.senha && (
          <div className="form-group">
            <label htmlFor="confirmaSenha" className="required">
              <MaterialIcon name="lock_outline" />
              Confirmar Senha
            </label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmaSenha"
                value={formData.confirmaSenha}
                onChange={(e) => handleInputChange('confirmaSenha', e.target.value)}
                className={errors.confirmaSenha ? 'error' : ''}
                placeholder="Confirme a senha"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
                title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <MaterialIcon name={showConfirmPassword ? 'visibility_off' : 'visibility'} />
              </button>
            </div>
            {errors.confirmaSenha && <span className="error-message">{errors.confirmaSenha}</span>}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="perfil" className="required">
            <MaterialIcon name="account_circle" />
            Perfil
          </label>
          <select
            id="perfil"
            value={formData.perfil}
            onChange={(e) => handleInputChange('perfil', e.target.value)}
            className={errors.perfil ? 'error' : ''}
            disabled={loading}
          >
            <option value="">Selecione um perfil</option>
            {perfis.map((perfil) => (
              <option key={perfil._id} value={perfil._id}>
                {perfil.nome}
              </option>
            ))}
          </select>
          {errors.perfil && <span className="error-message">{errors.perfil}</span>}
        </div>
      </div>

      <div className="form-actions">
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
              <MaterialIcon name="hourglass_empty" />
              Salvando...
            </>
          ) : (
            <>
              <MaterialIcon name="save" />
              {isEdicao ? 'Salvar Alterações' : 'Criar Usuário'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default FormularioUsuario;
