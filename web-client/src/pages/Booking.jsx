/*import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../services/api';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Booking.css';

export default function Booking() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/public/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Erro ao carregar serviços');
    }
  };

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE', { locale: ptBR }),
      dayNum: format(d, 'd'),
      month: format(d, 'MMM', { locale: ptBR }),
      isToday: i === 0,
    };
  });

  const loadAvailableSlots = async (dateStr) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const params = { date_str: dateStr };
      if (selectedService) params.service_id = selectedService.id;
      const response = await api.get('/public/available-slots', { params });
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj.date);
    setSelectedDateStr(dateObj.dateStr);
    loadAvailableSlots(dateObj.dateStr);
  };

  const handleSubmit = async () => {
    if (!clientName.trim() || clientName.trim().length < 2) {
      alert('Informe seu nome completo');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 8) {
      alert('Informe um telefone válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/public/book', {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        service_id: selectedService.id,
        scheduled_time: selectedSlot.datetime_iso,
        notes: notes.trim() || null,
      });
      setBookingResult(response.data);
      setStep(5);
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Erro ao agendar. Tente novamente.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedDateStr('');
    setSelectedSlot(null);
    setClientName('');
    setClientPhone('');
    setNotes('');
    setBookingResult(null);
    setSlots([]);
  };

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking-container">
        <div className="booking-header">
          <h1>Agendar Horário</h1>
          <p className="booking-subtitle">Agende sem precisar fazer login</p>
          {step < 5 && (
            <div className="booking-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1. Serviço</div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2. Data</div>
              <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>3. Horário</div>
              <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Dados</div>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="booking-step">
            <h2>Escolha o Serviço</h2>
            <div className="services-grid">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                >
                  <h3>{service.name}</h3>
                  {service.description && <p>{service.description}</p>}
                  <div className="service-info">
                    <span className="price">R$ {Number(service.price).toFixed(2).replace('.', ',')}</span>
                    <span className="duration">{service.duration_minutes} min</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step">
            <h2>Escolha a Data</h2>
            <div className="dates-grid">
              {availableDates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`date-card ${selectedDateStr === d.dateStr ? 'selected' : ''}`}
                  onClick={() => { handleDateSelect(d); setStep(3); }}
                >
                  <div className="date-day">{d.isToday ? 'Hoje' : d.dayName}</div>
                  <div className="date-number">{d.dayNum}</div>
                  <div className="date-month">{d.month}</div>
                </div>
              ))}
            </div>
            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(1)}>Voltar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step">
            <h2>Escolha o Horário</h2>
            {loadingSlots ? (
              <div className="loading-slots">Carregando horários disponíveis...</div>
            ) : slots.length === 0 ? (
              <div className="no-slots">
                <p>Sem horários disponíveis para esta data.</p>
                <button className="btn-back" onClick={() => setStep(2)}>Escolher outra data</button>
              </div>
            ) : (
              <div className="times-grid">
                {slots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`time-card ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                    onClick={() => { setSelectedSlot(slot); setStep(4); }}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            )}
            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(2)}>Voltar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="booking-step">
            <h2>Seus Dados</h2>
            <Card>
              <div className="booking-summary">
                <h3>Resumo do Agendamento</h3>
                <p><strong>Serviço:</strong> {selectedService?.name}</p>
                <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p><strong>Horário:</strong> {selectedSlot?.time}</p>
                <p><strong>Valor:</strong> R$ {Number(selectedService?.price).toFixed(2).replace('.', ',')}</p>
              </div>
            </Card>

            <Card>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div className="form-group">
                <label>Telefone / WhatsApp *</label>
                <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguma preferência?" rows={3} />
              </div>
            </Card>

            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(3)}>Voltar</button>
              <button className="btn-confirm" onClick={handleSubmit} disabled={loading || !clientName || !clientPhone}>
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && bookingResult && (
          <div className="booking-step success-step">
            <div className="success-icon">✅</div>
            <h2>Agendamento Confirmado!</h2>
            <p className="success-subtitle">Seu agendamento foi realizado com sucesso</p>

            <Card>
              <div className="confirmation-details">
                <div className="detail-row"><span>Serviço</span><strong>{bookingResult.service_name}</strong></div>
                <div className="detail-row"><span>Data/Hora</span><strong>{bookingResult.scheduled_time}</strong></div>
                <div className="detail-row"><span>Nome</span><strong>{bookingResult.client_name}</strong></div>
                <div className="detail-row"><span>Telefone</span><strong>{bookingResult.client_phone}</strong></div>
                <div className="detail-row"><span>Status</span><strong className="status-pending">Pendente</strong></div>
              </div>
            </Card>

            <p className="confirmation-note">O barbeiro irá confirmar seu agendamento em breve.</p>
            <button className="btn-new-booking" onClick={resetBooking}>Fazer novo agendamento</button>
          </div>
        )}
      </div>
    </div>
  );
}*/






import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import api from '../services/api';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Booking.css';
import { useAuth } from '../contexts/AuthContext';

export default function Booking() {
  const { user } = useAuth(); // Pega os dados do usuário do contexto
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState(''); // Adiciona estado para email
  const [notes, setNotes] = useState('');

  // Efeito para preencher os dados do usuário quando estiver logado
  useEffect(() => {
    if (user) {
      setClientName(user.name || '');
      setClientEmail(user.email || '');
      // Não preenche phone automaticamente porque pode ser diferente do cadastro
    }
  }, [user]);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await api.get('/public/services');
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Erro ao carregar serviços');
    }
  };

  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const d = addDays(new Date(), i);
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE', { locale: ptBR }),
      dayNum: format(d, 'd'),
      month: format(d, 'MMM', { locale: ptBR }),
      isToday: i === 0,
    };
  });

  const loadAvailableSlots = async (dateStr) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const params = { date_str: dateStr };
      if (selectedService) params.service_id = selectedService.id;
      const response = await api.get('/public/available-slots', { params });
      setSlots(response.data.slots || []);
    } catch (error) {
      console.error('Error loading slots:', error);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDateSelect = (dateObj) => {
    setSelectedDate(dateObj.date);
    setSelectedDateStr(dateObj.dateStr);
    loadAvailableSlots(dateObj.dateStr);
  };

  const handleSubmit = async () => {
    if (!clientName.trim() || clientName.trim().length < 2) {
      alert('Informe seu nome completo');
      return;
    }
    if (!clientPhone.trim() || clientPhone.trim().length < 8) {
      alert('Informe um telefone válido');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/public/book', {
        client_name: clientName.trim(),
        client_phone: clientPhone.trim(),
        service_id: selectedService.id,
        scheduled_time: selectedSlot.datetime_iso,
        notes: notes.trim() || null,
      });
      setBookingResult(response.data);
      setStep(5);
    } catch (error) {
      const msg = error?.response?.data?.detail || 'Erro ao agendar. Tente novamente.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedDateStr('');
    setSelectedSlot(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setNotes('');
    setBookingResult(null);
    setSlots([]);
  };

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking-container">
        <div className="booking-header">
          <h1>Agendar Horário</h1>
          <p className="booking-subtitle">Agende sem precisar fazer login</p>
          {step < 5 && (
            <div className="booking-steps">
              <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>1. Serviço</div>
              <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'done' : ''}`}>2. Data</div>
              <div className={`step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'done' : ''}`}>3. Horário</div>
              <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Dados</div>
            </div>
          )}
        </div>

        {step === 1 && (
          <div className="booking-step">
            <h2>Escolha o Serviço</h2>
            <div className="services-grid">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedService(service); setStep(2); }}
                >
                  <h3>{service.name}</h3>
                  {service.description && <p>{service.description}</p>}
                  <div className="service-info">
                    <span className="price">R$ {Number(service.price).toFixed(2).replace('.', ',')}</span>
                    <span className="duration">{service.duration_minutes} min</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step">
            <h2>Escolha a Data</h2>
            <div className="dates-grid">
              {availableDates.map((d) => (
                <div
                  key={d.dateStr}
                  className={`date-card ${selectedDateStr === d.dateStr ? 'selected' : ''}`}
                  onClick={() => { handleDateSelect(d); setStep(3); }}
                >
                  <div className="date-day">{d.isToday ? 'Hoje' : d.dayName}</div>
                  <div className="date-number">{d.dayNum}</div>
                  <div className="date-month">{d.month}</div>
                </div>
              ))}
            </div>
            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(1)}>Voltar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="booking-step">
            <h2>Escolha o Horário</h2>
            {loadingSlots ? (
              <div className="loading-slots">Carregando horários disponíveis...</div>
            ) : slots.length === 0 ? (
              <div className="no-slots">
                <p>Sem horários disponíveis para esta data.</p>
                <button className="btn-back" onClick={() => setStep(2)}>Escolher outra data</button>
              </div>
            ) : (
              <div className="times-grid">
                {slots.map((slot) => (
                  <div
                    key={slot.time}
                    className={`time-card ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                    onClick={() => { setSelectedSlot(slot); setStep(4); }}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            )}
            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(2)}>Voltar</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="booking-step">
            <h2>Seus Dados</h2>

            {/* Banner informativo para usuário logado */}
            {user && (
              <div className="user-logged-info" style={{
                backgroundColor: '#e8f5e9',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                color: '#2e7d32',
                border: '1px solid #c8e6c9'
              }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>
                  ✓ Você está logado como <strong>{user.name}</strong>! 
                  Seus dados foram preenchidos automaticamente.
                </p>
              </div>
            )}

            {/* Banner para visitante */}
            {!user && (
              <div className="visitor-info" style={{
                backgroundColor: '#fff3e0',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                color: '#e65100',
                border: '1px solid #ffe0b2'
              }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>
                  ℹ️ Você está agendando como visitante.
                </p>
              </div>
            )}

            <Card>
              <div className="booking-summary">
                <h3>Resumo do Agendamento</h3>
                <p><strong>Serviço:</strong> {selectedService?.name}</p>
                <p><strong>Data:</strong> {selectedDate && format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                <p><strong>Horário:</strong> {selectedSlot?.time}</p> {/* CORRIGIDO: selectedSlot.time em vez de selectedTime */}
                <p><strong>Valor:</strong> R$ {Number(selectedService?.price).toFixed(2).replace('.', ',')}</p>
              </div>
            </Card>

            <Card>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Seu nome completo"
                  readOnly={!!user} // Readonly se estiver logado
                  style={user ? { backgroundColor: '#f5f5f5' } : {}}
                />
              </div>

              <div className="form-group">
                <label>Telefone / WhatsApp *</label>
                <input 
                  type="tel" 
                  value={clientPhone} 
                  onChange={(e) => setClientPhone(e.target.value)} 
                  placeholder="(00) 00000-0000" 
                />
                {user && (
                  <small style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '5px' }}>
                    Confirme seu telefone para contato
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>Email {user ? '*' : '(opcional)'}</label>
                <input 
                  type="email" 
                  value={clientEmail} 
                  onChange={(e) => setClientEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  readOnly={!!user} // Readonly se estiver logado
                  style={user ? { backgroundColor: '#f5f5f5' } : {}}
                  required={!!user} // Email obrigatório apenas para usuários logados? Ajuste conforme sua necessidade
                />
              </div>

              <div className="form-group">
                <label>Observações (opcional)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Alguma preferência?" 
                  rows={3} 
                />
              </div>
            </Card>

            <div className="booking-navigation">
              <button className="btn-back" onClick={() => setStep(3)}>Voltar</button>
              <button 
                className="btn-confirm" 
                onClick={handleSubmit} 
                disabled={loading || !clientName || !clientPhone || (user && !clientEmail)}
              >
                {loading ? 'Agendando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        )}

        {step === 5 && bookingResult && (
          <div className="booking-step success-step">
            <div className="success-icon">✅</div>
            <h2>Agendamento Confirmado!</h2>
            <p className="success-subtitle">Seu agendamento foi realizado com sucesso</p>

            <Card>
              <div className="confirmation-details">
                <div className="detail-row"><span>Serviço</span><strong>{bookingResult.service_name}</strong></div>
                <div className="detail-row"><span>Data/Hora</span><strong>{bookingResult.scheduled_time}</strong></div>
                <div className="detail-row"><span>Nome</span><strong>{bookingResult.client_name}</strong></div>
                <div className="detail-row"><span>Telefone</span><strong>{bookingResult.client_phone}</strong></div>
                <div className="detail-row"><span>Status</span><strong className="status-pending">Pendente</strong></div>
              </div>
            </Card>

            <p className="confirmation-note">O barbeiro irá confirmar seu agendamento em breve.</p>
            <button className="btn-new-booking" onClick={resetBooking}>Fazer novo agendamento</button>
          </div>
        )}
      </div>
    </div>
  );
}
