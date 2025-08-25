import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authService, LoginData } from '../../services/api';
import './styles.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Prevenir múltiplas submissões
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authService.login(formData as LoginData);
      
      if (response.success && response.data) {
        console.log('Login realizado com sucesso:', response.data);
        // Usar o contexto de autenticação
        login(response.data.user, response.data.token);
        // Redirecionar para a página principal
        navigate('/');
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="logo-section">
                <img 
                  src="https://www.ubm.br/seminario-pesquisa/images/logo.png" 
                  alt="Logo do Seminário UBM"
                  className="seminario-logo"
                />
              </div>
              <h2>Fazer Login</h2>
              <p>Sistema administrativo de atividades do seminário</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="error-message" style={{ 
                  color: '#ff4444', 
                  backgroundColor: '#ffe6e6', 
                  padding: '10px', 
                  borderRadius: '4px', 
                  marginBottom: '20px',
                  border: '1px solid #ffcccc'
                }}>
                  {error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="email">E-mail:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                  inputMode="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="senha">Senha:</label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-full"
                disabled={isLoading}
                style={{ 
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
