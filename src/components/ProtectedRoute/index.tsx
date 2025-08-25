import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../MaterialIcon';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-route-fallback">
        {fallback || (
          <div className="container">
            <div className="access-denied">
              <div className="access-denied-content">
                <div className="access-denied-icon">
                  <MaterialIcon name="lock" size="large" className="material-icon--danger" />
                </div>
                <h2>Acesso Restrito</h2>
                <p>
                  Você precisa fazer login para acessar esta funcionalidade.
                </p>
                <p>
                  Faça login com suas credenciais para ter acesso completo ao sistema do seminário.
                </p>
                <div className="access-denied-actions">
                  <a href="/login" className="btn btn-primary">
                    <MaterialIcon name="login" size="small" className="material-icon--animated" />
                    Fazer Login
                  </a>
                  <a href="/" className="btn btn-secondary">
                    <MaterialIcon name="home" size="small" className="material-icon--animated" />
                    Voltar ao Início
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
