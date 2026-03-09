import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingAppointments: [],
    totalPoints: 0,
    activePromotions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const appointmentsRes = await api.get('/appointments');
      const upcoming = appointmentsRes.data
        .filter((a) => new Date(a.scheduled_time) > new Date())
        .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))
        .slice(0, 3);

      setStats({
        upcomingAppointments: upcoming,
        totalPoints: 150, // Mock - precisa implementar endpoint
        activePromotions: 3, // Mock - precisa implementar endpoint
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Olá, {user?.name}! 👋</h1>
          <p>Bem-vindo à sua área de Cliente</p>
        </div>

        {/* <div className="stats-grid">
          <Link to="/historico" className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>Histórico</h3>
              <p>Ver todos os serviços</p>
            </div>
          </Link>

          <Link to="/fidelidade" className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>{stats.totalPoints} Pontos</h3>
              <p>Programa de fidelidade</p>
            </div>
          </Link>

          <Link to="/promocoes" className="stat-card">
            <div className="stat-icon">🎁</div>
            <div className="stat-info">
              <h3>{stats.activePromotions} Promoções</h3>
              <p>Ofertas disponíveis</p>
            </div>
          </Link>

          <Link to="/agendar" className="stat-card primary">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Novo Agendamento</h3>
              <p>Agendar horário</p>
            </div>
          </Link>
        </div>*/}

        <div className="quick-actions">
          <h2>Ações Rápidas</h2>
          <div className="actions-grid">
            <Link to="/agendar" className="action-card">
              <span className="action-icon">📅</span>
              <h3>Agendar Horário</h3>
            </Link>
            <Link to="/promocoes" className="action-card">
              <span className="action-icon">🎁</span>
              <h3>Ver Promoções</h3>
            </Link>
            <Link to="/fidelidade" className="action-card">
              <span className="action-icon">⭐</span>
              <h3>Meus Pontos</h3>
            </Link>
            <Link to="/historico" className="action-card">
              <span className="action-icon">📊</span>
              <h3>Histórico</h3>
            </Link>
          </div>
        </div>


        <Card>
          <div className="section-header">
            <h2>Próximos Agendamentos</h2>
            <Link to="/historico">Ver todos</Link>
          </div>

          {stats.upcomingAppointments.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum agendamento próximo</p>
              <Link to="/agendar" className="btn-primary">
                Agendar Agora
              </Link>
            </div>
          ) : (
            <div className="appointments-list">
              {stats.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-date">
                    <div className="date-day">
                      {format(new Date(appointment.scheduled_time), 'd')}
                    </div>
                    <div className="date-month">
                      {format(new Date(appointment.scheduled_time), 'MMM', { locale: ptBR })}
                    </div>
                  </div>
                  <div className="appointment-info">
                    <h3>{format(new Date(appointment.scheduled_time), 'HH:mm')}</h3>
                    <p>Status: {appointment.status}</p>
                  </div>
                  <div className={`appointment-status ${appointment.status}`}>
                    {appointment.status === 'pending' && 'Pendente'}
                    {appointment.status === 'confirmed' && 'Confirmado'}
                    {appointment.status === 'completed' && 'Concluído'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        
      </div>
    </div>
  );
}
