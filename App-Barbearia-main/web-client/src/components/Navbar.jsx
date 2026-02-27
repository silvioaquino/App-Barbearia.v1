import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          💈 Barbershop
        </Link>
        
        <div className="navbar-menu">
          {!user ? (
            <>
              <Link to="/agendar" className="navbar-link">Agendar</Link>
              <Link to="/login" className="navbar-link">Entrar</Link>
              <Link to="/registrar" className="navbar-button">Cadastrar</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="navbar-link">Início</Link>
              <Link to="/historico" className="navbar-link">Histórico</Link>
              <Link to="/promocoes" className="navbar-link">Promoções</Link>
              <Link to="/fidelidade" className="navbar-link">Fidelidade</Link>
              <button onClick={handleLogout} className="navbar-button-logout">
                Sair
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
