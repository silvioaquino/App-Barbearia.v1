# Barbershop Manager - PRD

## Problem Statement
App completo de gestão de barbearia com app mobile (barbeiro), web app (clientes), e backend.

## Architecture
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (NeonDB)
- **Mobile App**: Expo (React Native) com Expo Router
- **Web Client**: React + Vite + React Router
- **Auth**: Emergent Google Auth (OAuth 2.0)

## Completed Features

### Core
- Auth Google OAuth, CRUD Serviços/Produtos, Vendas de produtos
- CRUD Agendamentos com WhatsApp notifications
- Página pública de agendamento, Gestão de agenda, Caixa registradora
- Dashboard, Resumo diário WhatsApp ao fechar caixa

### Programa de Fidelidade
- R$1 = 1 ponto, 100pts = corte grátis (configurável)
- Pontos automáticos ao concluir serviço
- Gestão pelo barbeiro + consulta pelo cliente no web

### Relatórios Financeiros
- Dashboard Hoje/Semana/Mês, Top serviços, Gráfico 7 dias

### Promoções + Fotos
- CRUD promoções, Upload de fotos de serviços

### Lembretes WhatsApp (Mar 5, 2026)
- Scheduler em background (a cada 5 min) verifica agendamentos na próxima hora
- Envia lembrete automático via WhatsApp para o cliente
- Marca agendamento como notificado para evitar duplicação
- Endpoint manual POST /api/appointments/send-reminders para testes

### Web Client
- Histórico, Promoções, Fidelidade - tudo com APIs reais

## Testing Status
- iteration_1: 43/43 pass
- iteration_2: 9/9 pass
- iteration_3: 39/39 pass

## Notes
- WhatsApp é ESTRUTURAL - funciona com credenciais Meta Business API
- Login mobile requer configuração do IP local via "Configurar Servidor"
