import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../services/api';
import './Loyalty.css';

export default function Loyalty() {
  const [points, setPoints] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [searched, setSearched] = useState(false);

  const searchPoints = async (e) => {
    e?.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const [pointsRes, historyRes] = await Promise.all([
        api.get(`/loyalty/client/${phone.trim()}`),
        api.get(`/loyalty/client/${phone.trim()}/history`),
      ]);
      setPoints(pointsRes.data);
      setHistory(historyRes.data);
      setSearched(true);
    } catch (error) {
      console.error('Erro ao buscar pontos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loyalty-page">
      <Navbar />
      
      <div className="loyalty-container">
        <div className="loyalty-header">
          <h1 data-testid="loyalty-title">Programa de Fidelidade</h1>
          <p>Acumule pontos e troque por benefícios exclusivos</p>
        </div>

        <Card className="search-card">
          <form onSubmit={searchPoints} className="search-form">
            <h3>Consultar seus pontos</h3>
            <div className="search-row">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Digite seu telefone"
                className="search-input"
                data-testid="loyalty-phone-input"
              />
              <button type="submit" className="search-btn" data-testid="loyalty-search-btn">
                Consultar
              </button>
            </div>
          </form>
        </Card>

        {searched && points && (
          <>
            <Card className="points-card">
              <div className="points-display">
                <div className="points-main">
                  <div className="points-number" data-testid="loyalty-points">{points.points}</div>
                  <div className="points-label">Pontos</div>
                </div>
                <div className="points-info">
                  <div className="info-row">
                    <span>Total ganhos:</span>
                    <strong>{points.total_earned}</strong>
                  </div>
                  <div className="info-row">
                    <span>Total resgatados:</span>
                    <strong>{points.total_redeemed}</strong>
                  </div>
                </div>
              </div>

              {points.redemption_threshold && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progresso para resgate</span>
                    <span>{Math.max(points.redemption_threshold - points.points, 0)} pontos faltando</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min((points.points / points.redemption_threshold) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="reward-desc">
                    Meta: {points.redemption_threshold} pontos = {points.reward_description}
                  </p>
                </div>
              )}
            </Card>

            {history.length > 0 && (
              <>
                <div className="section-title">
                  <h2>Histórico de Pontos</h2>
                </div>
                <Card>
                  <div className="history-list">
                    {history.map((item) => (
                      <div key={item.id} className="history-item">
                        <div className="history-date">
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="history-description">{item.description}</div>
                        <div className={`history-points ${item.type === 'earn' ? 'earn' : 'redeem'}`}>
                          {item.type === 'earn' ? '+' : '-'}{item.points} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </>
        )}

        {searched && !loading && !points?.points && (
          <Card>
            <div className="empty-state">
              <span className="empty-icon">&#11088;</span>
              <h3>Nenhum ponto encontrado</h3>
              <p>Faça serviços na barbearia para acumular pontos!</p>
            </div>
          </Card>
        )}

        <Card className="info-card">
          <h3>Como Funciona?</h3>
          <ul>
            <li>Cada R$1 gasto em serviços = 1 ponto</li>
            <li>Acumule pontos automaticamente ao concluir serviços</li>
            <li>Atinja a meta de pontos e resgate seu prêmio</li>
            <li>Consulte seu saldo usando o telefone cadastrado</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
