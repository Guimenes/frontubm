import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo">
            <Link to="/cronograma" onClick={closeMenu}>
              <img 
                src="https://www.ubm.br/seminario-pesquisa/images/logo.png" 
                alt="Logo do Seminário UBM"
                className="seminario-logo2"
              />
            </Link>
          </div>

          {/* Menu Hamburger */}
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <MaterialIcon name="menu" />
          </button>
        </div>
      </header>

      {/* Menu Lateral */}
      <nav className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {/* Saudação do usuário */}
          {isAuthenticated && user && (
            <div className="user-greeting">
              <MaterialIcon name="account_circle" />
              <span>Olá, {user.nome}!</span>
            </div>
          )}

          {/* Menu de navegação */}
          <ul className="nav-menu">
            {/* Cronograma - sempre visível */}
            <li>
              <Link 
                to="/cronograma" 
                className={isActiveRoute('/cronograma') ? 'active' : ''}
                onClick={closeMenu}
              >
                <MaterialIcon name="schedule" />
                <span>Cronograma</span>
              </Link>
            </li>

            {/* Itens apenas para usuários logados */}
            {isAuthenticated && (
              <>
                {/* Eventos */}
                {(hasPermission('EVENTOS_LISTAR') || hasPermission('EVENTOS_CRIAR') || 
                  hasPermission('EVENTOS_EDITAR') || hasPermission('EVENTOS_EXCLUIR')) && (
                  <li>
                    <Link 
                      to="/eventos" 
                      className={isActiveRoute('/eventos') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <MaterialIcon name="event" />
                      <span>Eventos</span>
                    </Link>
                  </li>
                )}

                {/* Cursos */}
                {(hasPermission('CURSOS_LISTAR') || hasPermission('CURSOS_CRIAR') || 
                  hasPermission('CURSOS_EDITAR') || hasPermission('CURSOS_EXCLUIR')) && (
                  <li>
                    <Link 
                      to="/cursos" 
                      className={isActiveRoute('/cursos') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <MaterialIcon name="school" />
                      <span>Cursos</span>
                    </Link>
                  </li>
                )}

                {/* Locais */}
                {(hasPermission('LOCAIS_LISTAR') || hasPermission('LOCAIS_CRIAR') || 
                  hasPermission('LOCAIS_EDITAR') || hasPermission('LOCAIS_EXCLUIR')) && (
                  <li>
                    <Link 
                      to="/locais" 
                      className={isActiveRoute('/locais') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <MaterialIcon name="place" />
                      <span>Locais</span>
                    </Link>
                  </li>
                )}

                {/* Usuários */}
                {(hasPermission('USUARIOS_LISTAR') || hasPermission('USUARIOS_CRIAR') || 
                  hasPermission('USUARIOS_EDITAR') || hasPermission('USUARIOS_EXCLUIR')) && (
                  <li>
                    <Link 
                      to="/usuarios" 
                      className={isActiveRoute('/usuarios') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <MaterialIcon name="people" />
                      <span>Usuários</span>
                    </Link>
                  </li>
                )}

                {/* Permissões */}
                {(hasPermission('PERMISSOES_LISTAR') || hasPermission('PERFIS_LISTAR')) && (
                  <li>
                    <Link 
                      to="/permissoes" 
                      className={isActiveRoute('/permissoes') ? 'active' : ''}
                      onClick={closeMenu}
                    >
                      <MaterialIcon name="security" />
                      <span>Permissões</span>
                    </Link>
                  </li>
                )}
              </>
            )}

            {/* Opções de autenticação */}
            {!isAuthenticated ? (
              <li className="auth-item">
                <Link 
                  to="/login" 
                  className={isActiveRoute('/login') ? 'active' : ''}
                  onClick={closeMenu}
                >
                  <MaterialIcon name="login" />
                  <span>Login</span>
                </Link>
              </li>
            ) : (
              <li className="auth-item">
                <button 
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  <MaterialIcon name="logout" />
                  <span>Sair</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Overlay para fechar o menu no mobile */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={closeMenu}></div>}
    </>
  );
};

export default Header;
