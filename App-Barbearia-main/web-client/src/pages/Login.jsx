import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Redirect to Emergent OAuth
      const redirectUrl = window.location.origin + '/auth-callback';
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      window.location.href = authUrl;
    } catch (error) {
      alert('Erro ao fazer login. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Entrar</h1>
            <p>Acesse sua conta para ver histórico, promoções e fidelidade</p>
          </div>

          <button
            className="google-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
              <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
              <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
              <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
            </svg>
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </button>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="demo-info">
            <p>ℹ️ Para demo, use o botão acima para fazer login com Google</p>
          </div>

          <div className="auth-footer">
            <p>
              Não tem uma conta?{' '}
              <Link to="/registrar">Cadastre-se</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
