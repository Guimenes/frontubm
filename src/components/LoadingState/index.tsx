import React from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface LoadingStateProps {
  title?: string;
  message?: string;
  icon?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Carregando...',
  message = 'Por favor, aguarde enquanto carregamos os dados.',
  icon = 'schedule'
}) => {
  return (
    <div className="loading-state">
      <div className="loading-state-content">
        <div className="loading-icon-wrapper">
          <MaterialIcon name={icon} size="large" className="loading-icon" />
          <div className="loading-spinner"></div>
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
