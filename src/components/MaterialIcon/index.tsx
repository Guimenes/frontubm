import React from 'react';
import './styles.css';

interface MaterialIconProps {
  name: string;
  size?: 'small' | 'medium' | 'large' | number;
  className?: string;
  style?: React.CSSProperties;
}

const MaterialIcon: React.FC<MaterialIconProps> = ({ 
  name, 
  size = 'medium', 
  className = '', 
  style = {} 
}) => {
  const getSizeClass = () => {
    if (typeof size === 'number') {
      return '';
    }
    
    switch (size) {
      case 'small':
        return 'material-icon--small';
      case 'large':
        return 'material-icon--large';
      default:
        return 'material-icon--medium';
    }
  };

  const getSizeStyle = () => {
    if (typeof size === 'number') {
      return { fontSize: `${size}px`, ...style };
    }
    return style;
  };

  return (
    <span 
      className={`material-icons material-icon ${getSizeClass()} ${className}`}
      style={getSizeStyle()}
    >
      {name}
    </span>
  );
};

export default MaterialIcon;
