import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app">
      {!isLoginPage && <Header />}
      <main className={!isLoginPage ? 'with-header' : ''}>
        <Outlet />
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;
