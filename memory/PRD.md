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

### Promoções (Mobile + Web)
- Tela completa no app mobile: Criar, Editar, Ativar/Desativar, Remover promoções
- Acessível via Perfil > Gerenciamento > Promoções
- Clientes veem promoções ativas no web-client

### Fotos de Serviços (Mobile)
- Tela completa de gerenciamento de fotos por serviço
- Upload via câmera ou galeria (expo-image-picker)
- Botão "Fotos" em cada card de serviço na aba Serviços
- API pública para exibição na página de agendamento

### Lembretes WhatsApp
- Scheduler background (5 min) - lembrete 1h antes do agendamento
- Endpoint manual para testes

### Web Client
- Histórico, Promoções, Fidelidade com APIs reais

## Testing Status
- iteration_1: 43/43 pass
- iteration_2: 9/9 pass
- iteration_3: 39/39 pass
- iteration_4: 37/37 pass

## Notes
- WhatsApp é ESTRUTURAL - funciona com credenciais Meta Business API
- Login mobile: Configurar IP local via "Configurar Servidor"