import React from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import './Loyalty.css';

export default function Loyalty() {
  // Mock data - implementar endpoint no backend
  const loyaltyData = {
    points: 150,
    level: 'Prata',
    nextLevel: 'Ouro',
    pointsToNextLevel: 100,
    history: [
      { date: '2026-02-15', points: 50, description: 'Corte de cabelo' },
      { date: '2026-02-01', points: 50, description: 'Barba' },
      { date: '2026-01-20', points: 50, description: 'Corte de cabelo' },
    ],
  };

  const rewards = [
    { id: 1, name: 'Corte Grátis', points: 200, icon: '✂️' },
    { id: 2, name: 'Barba Grátis', points: 150, icon: '🪒' },
    { id: 3, name: '20% OFF', points: 100, icon: '🎁' },
    { id: 4, name: 'Produto Capilar', points: 300, icon: '🧴' },
  ];

  const progress = (loyaltyData.points / (loyaltyData.points + loyaltyData.pointsToNextLevel)) * 100;

  return (
    <div className="loyalty-page">
      <Navbar />
      
      <div className="loyalty-container">
        <div className="loyalty-header">
          <h1>⭐ Programa de Fidelidade</h1>
          <p>Acumule pontos e troque por benefícios exclusivos</p>
        </div>

        <Card className="points-card">
          <div className="points-display">
            <div className="points-main">
              <div className="points-number">{loyaltyData.points}</div>
              <div className="points-label">Pontos</div>
            </div>
            <div className="level-badge">
              <span className="level-icon">🏆</span>
              <span className="level-name">Nível {loyaltyData.level}</span>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Progresso para {loyaltyData.nextLevel}</span>
              <span>{loyaltyData.pointsToNextLevel} pontos faltando</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </Card>

        <div className="section-title">
          <h2>Resgatar Recompensas</h2>
        </div>

        <div className="rewards-grid">
          {rewards.map((reward) => {
            const canRedeem = loyaltyData.points >= reward.points;
            return (
              <Card key={reward.id} className="reward-card">
                <div className="reward-icon">{reward.icon}</div>
                <h3>{reward.name}</h3>
                <div className="reward-points">{reward.points} pontos</div>
                <button
                  className={`btn-redeem ${canRedeem ? '' : 'disabled'}`}
                  disabled={!canRedeem}
                >
                  {canRedeem ? 'Resgatar' : 'Pontos Insuficientes'}
                </button>
              </Card>
            );
          })}
        </div>

        <div className="section-title">
          <h2>Histórico de Pontos</h2>
        </div>

        <Card>
          <div className="history-list">
            {loyaltyData.history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-date">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="history-description">{item.description}</div>
                <div className="history-points">+{item.points} pts</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="info-card">
          <h3>Como Funciona?</h3>
          <ul>
            <li>✅ Ganhe 50 pontos a cada serviço realizado</li>
            <li>✅ Acumule pontos e suba de nível</li>
            <li>✅ Troque pontos por serviços e produtos</li>
            <li>✅ Níveis: Bronze → Prata → Ouro → Platinum</li>
            <li>✅ Quanto maior o nível, mais benefícios</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
