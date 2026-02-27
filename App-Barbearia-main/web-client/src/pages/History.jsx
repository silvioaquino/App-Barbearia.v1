import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './History.css';

export default function History() {
  const [history, setHistory] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const appointmentsRes = await api.get('/appointments');
      setAppointments(appointmentsRes.data.sort((a, b) => 
        new Date(b.scheduled_time) - new Date(a.scheduled_time)
      ));
      
      // TODO: Implementar endpoint de histórico de serviços
      // const historyRes = await api.get('/service-history');
      // setHistory(historyRes.data);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pendente', class: 'pending' },
      confirmed: { text: 'Confirmado', class: 'confirmed' },
      completed: { text: 'Concluído', class: 'completed' },
      cancelled: { text: 'Cancelado', class: 'cancelled' },
    };
    return badges[status] || { text: status, class: '' };
  };

  if (loading) {
    return (
      <div className="history-page">
        <Navbar />
        <div className="history-container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <Navbar />
      
      <div className="history-container">
        <div className="history-header">
          <h1>Meu Histórico</h1>
          <p>Acompanhe todos os seus agendamentos e serviços</p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Agendamentos ({appointments.length})
          </button>
          <button
            className={`tab ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Serviços Realizados ({history.length})
          </button>
        </div>

        {activeTab === 'appointments' && (
          <div className="history-list">
            {appointments.length === 0 ? (
              <Card>
                <div className="empty-state">
                  <span className="empty-icon">📅</span>
                  <h3>Nenhum agendamento ainda</h3>
                  <p>Faça seu primeiro agendamento para começar</p>
                </div>
              </Card>
            ) : (
              appointments.map((appointment) => {
                const badge = getStatusBadge(appointment.status);
                return (
                  <Card key={appointment.id}>
                    <div className="history-item">
                      <div className="history-date">
                        <div className="date-box">
                          <div className="date-day">
                            {format(new Date(appointment.scheduled_time), 'd')}
                          </div>
                          <div className="date-month">
                            {format(new Date(appointment.scheduled_time), 'MMM', { locale: ptBR })}
                          </div>
                          <div className="date-year">
                            {format(new Date(appointment.scheduled_time), 'yyyy')}
                          </div>
                        </div>
                      </div>
                      <div className="history-details">
                        <h3>
                          {format(new Date(appointment.scheduled_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </h3>
                        <p className="history-time">
                          Horário: {format(new Date(appointment.scheduled_time), 'HH:mm')}
                        </p>
                        {appointment.notes && (
                          <p className="history-notes">{appointment.notes}</p>
                        )}
                        <div className={`status-badge ${badge.class}`}>
                          {badge.text}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="history-list">
            <Card>
              <div className="empty-state">
                <span className="empty-icon">✂️</span>
                <h3>Histórico de serviços</h3>
                <p>Em breve você verá aqui todos os serviços realizados com fotos!</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
