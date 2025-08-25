import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'
import Cronograma from './pages/Cronograma'
import Eventos from './pages/Eventos'
import Locais from './pages/Locais'
import Cursos from './pages/Cursos'
import Usuarios from './pages/Usuarios'
import Permissoes from './pages/Permissoes'
import Login from './pages/Login'
import './styles/index.css'

// Helper para proteger rotas via loader
const requireAuth = () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      throw redirect('/login')
    }
    return null
  } catch {
    throw redirect('/login')
  }
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Cronograma /> },
      { path: 'cronograma', element: <Cronograma /> },
      { path: 'login', element: <Login /> },
      { path: 'eventos', element: <Eventos />, loader: requireAuth },
      { path: 'trabalhos', loader: () => redirect('/eventos') }, // Redirecionamento da rota antiga
      { path: 'locais', element: <Locais />, loader: requireAuth },
      { path: 'cursos', element: <Cursos />, loader: requireAuth },
      { path: 'usuarios', element: <Usuarios />, loader: requireAuth },
      { path: 'permissoes', element: <Permissoes />, loader: requireAuth },
    ],
  },
], ({
  future: ( {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  } as unknown ) as any,
}))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider 
        router={router}
        future={{
          // Flags v7 para remover avisos e alinhar comportamento futuro
          // Tipos podem não existir nesta versão, por isso o cast para any
          ...( {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          } as any ),
        }}
      />
    </AuthProvider>
  </React.StrictMode>,
)
