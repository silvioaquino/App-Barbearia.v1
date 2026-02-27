import React from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import './Promotions.css';

export default function Promotions() {
  // Mock data - implementar endpoint no backend
  const promotions = [
    {
      id: 1,
      title: '20% OFF em Cortes',
      description: 'Desconto de 20% em todos os cortes de cabelo durante a semana',
      validUntil: '2026-03-15',
      code: 'CORTE20',
      active: true,
    },
    {
      id: 2,
      title: 'Barba + Cabelo',
      description: 'Leve barba e cabelo e ganhe 15% de desconto no combo',
      validUntil: '2026-03-30',
      code: 'COMBO15',
      active: true,
    },
    {
      id: 3,
      title: 'Cliente Novo',
      description: 'Primeira vez na barbearia? Ganhe 30% OFF',
      validUntil: '2026-12-31',
      code: 'NOVO30',
      active: true,
    },
  ];

  return (
    <div className="promotions-page">
      <Navbar />
      
      <div className="promotions-container">
        <div className="promotions-header">
          <h1>🎁 Promoções Exclusivas</h1>
          <p>Aproveite nossas ofertas especiais para clientes cadastrados</p>
        </div>

        <div className="promotions-grid">
          {promotions.map((promo) => (
            <Card key={promo.id} className="promo-card">
              <div className="promo-badge">EXCLUSIVO</div>
              <h2>{promo.title}</h2>
              <p className="promo-description">{promo.description}</p>
              
              <div className="promo-code">
                <span className="code-label">Código:</span>
                <span className="code-value">{promo.code}</span>
              </div>

              <div className="promo-footer">
                <p className="promo-valid">
                  Válido até: {new Date(promo.validUntil).toLocaleDateString('pt-BR')}
                </p>
                <button className="btn-use-promo">Usar Promoção</button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="promo-info">
          <h3>Como usar suas promoções?</h3>
          <ol>
            <li>Escolha a promoção desejada</li>
            <li>Copie o código promocional</li>
            <li>Use o código ao fazer seu agendamento</li>
            <li>Aproveite o desconto no dia do serviço!</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
