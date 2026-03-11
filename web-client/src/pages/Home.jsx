import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <Navbar />
      
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Barbershop Premium</h1>
          <p className="hero-subtitle">
            Agende seu horário com os melhores profissionais
          </p>
          <div className="hero-buttons">
            <Link to="/agendar" className="btn-primary">
              Agendar Agora
            </Link>
            <Link to="/login" className="btn-secondary">
              Área do Cliente
            </Link>
          </div>
        </div>
      </section>

      <section className="two-options">
        <div className="options-container">
          <h2 className="section-title">Como deseja agendar?</h2>
          
          <div className="options-grid">
            <div className="option-card public-card">
              <div className="option-icon">📅</div>
              <h3>Agendamento Rápido</h3>
              <p>Agende sem criar conta. Basta informar seu nome e telefone.</p>
              <ul className="option-features">
                <li>Sem necessidade de cadastro</li>
                <li>Escolha o serviço, data e horário</li>
                <li>Confirmação imediata</li>
              </ul>
              <Link to="/agendar" className="option-btn">
                Agendar sem Login
              </Link>
            </div>
            
            <div className="option-card member-card">
              <div className="option-badge">RECOMENDADO</div>
              <div className="option-icon">⭐</div>
              <h3>Área do Cliente</h3>
              <p>Faça login e aproveite benefícios exclusivos.</p>
              <ul className="option-features">
                <li>Programa de Fidelidade com pontos</li>
                <li>Promoções e descontos exclusivos</li>
                <li>Histórico completo de serviços</li>
                <li>Agendamento com perfil salvo</li>
              </ul>
              <Link to="/login" className="option-btn premium">
                Entrar / Criar Conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <h2 className="section-title">Por que escolher nossa barbearia?</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✂️</div>
              <h3>Profissionais Qualificados</h3>
              <p>Equipe experiente e atualizada com as tendências</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Programa de Fidelidade</h3>
              <p>Ganhe pontos e troque por serviços gratuitos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Promoções Exclusivas</h3>
              <p>Ofertas especiais para clientes cadastrados</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Agende Online</h3>
              <p>Escolha o melhor horário direto pelo site</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Barbershop Premium. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
