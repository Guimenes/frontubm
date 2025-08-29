import React from 'react';
import MaterialIcon from '../MaterialIcon';
import './styles.css';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ops! Algo deu errado',
  message,
  onRetry
}) => {
  return (
    <div className="error-state">
      <div className="error-state-content">
        <MaterialIcon name="error_outline" size="large" className="error-icon" />
        <h2>{title}</h2>
        <p>{message}</p>
        {onRetry && (
          <button className="retry-button" onClick={onRetry}>
            <MaterialIcon name="refresh" size="small" />
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
