// Configuração da API baseada no ambiente
const getApiBaseUrl = () => {
  // Se estiver rodando no modo desenvolvimento local
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // Para produção, usar sempre o IP do backend
  return 'http://72.60.8.84:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Para debug
console.log('API Base URL configurada para:', API_BASE_URL);
console.log('Hostname atual:', window.location.hostname);
