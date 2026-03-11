# Barbershop Manager (AgendaPro) - PRD

## Problem Statement
App completo de gestao de barbearia com app mobile (barbeiro), web app (clientes), e backend.
Modelo de negocio duplo: SaaS (planos mensais) + venda unica do sistema.

## Architecture
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL (NeonDB)
- **Mobile App**: Expo (React Native) com Expo Router
- **Web Client**: React + Vite + React Router
- **Landing Page**: HTML/CSS standalone (para vendas)
- **Auth**: Emergent Google Auth (OAuth 2.0)

## Completed Features

### Core
- Auth Google OAuth, CRUD Servicos/Produtos, Vendas de produtos
- CRUD Agendamentos com WhatsApp notifications
- Pagina publica de agendamento, Gestao de agenda, Caixa registradora
- Dashboard, Resumo diario WhatsApp ao fechar caixa

### Programa de Fidelidade
- R$1 = 1 ponto, 100pts = corte gratis (configuravel)
- Pontos automaticos ao concluir servico
- Gestao pelo barbeiro + consulta pelo cliente no web

### Relatorios Financeiros
- Dashboard Hoje/Semana/Mes, Top servicos, Grafico 7 dias

### Promocoes (Mobile + Web)
- Tela completa no app mobile: Criar, Editar, Ativar/Desativar, Remover
- Clientes veem promocoes ativas no web-client

### Fotos de Servicos (Mobile)
- Upload via camera ou galeria (expo-image-picker)
- API publica para exibicao na pagina de agendamento

### Lembretes WhatsApp
- Scheduler background (5 min) - lembrete 1h antes do agendamento
- Endpoint manual para testes

### Web Client
- Historico, Promocoes, Fidelidade com APIs reais

### Dark Mode Mobile (CONCLUIDO - 09/03/2026)
- ThemeContext com temas light/dark completos
- Toggle no Perfil, persistido via AsyncStorage
- Aplicado em TODAS as telas e componentes compartilhados
- Tab bar, headers, modais e StatusBar dinamicos
- Testado: 100% pass rate (iteration_5)

### Dark Mode Web Client (CONCLUIDO - 10/03/2026)
- CSS Variables para light/dark em index.css
- ThemeContext com toggle via data-theme no HTML root
- Persistencia via localStorage
- Botao toggle na Navbar (sol/lua)
- Todas as paginas e componentes atualizados:
  - Home, Booking, Login, Dashboard, History, Promotions, Loyalty, AuthCallback
  - Navbar, Card, Loading
- Testado: 100% pass rate em todas as paginas publicas

### Landing Page de Vendas (CONCLUIDO - 10/03/2026)
- Pagina profissional "AgendaPro" com design dark premium
- Secoes: Hero, Social Proof, Features, Como Funciona, App Showcase, Precos, Depoimentos, FAQ, CTA, Footer
- 3 planos SaaS: Basico R$49, Profissional R$99, Premium R$199
- Opcao de venda unica a partir de R$2.500

### Documentacao SaaS (CONCLUIDO - 10/03/2026)
- Roadmap completo para transformacao SaaS em /app/ROADMAP_SAAS.md
- Guia de publicacao em /app/GUIA_PUBLICACAO.md

## Pending Tasks

### P1 - WhatsApp via QR Code
- Trocar integracao WhatsApp para conexao via QR code (estilo WhatsApp Web)
- Atualmente: apenas logs no console (MOCKED)

### P1 - Pagamento Online com Pix
- Integrar gateway de pagamento com suporte a Pix para agendamentos online

### P1 - Logica de Upload de Fotos
- Revisar performance do armazenamento Base64 no DB

### P2 - Correcao botoes Cancelar/Logout
- Desprioritizado pelo usuario

### P2 - Relatorios Financeiros Avancados
- Filtros por data, graficos mais detalhados

## SaaS Transformation (Future)
- Multi-tenancy (tenant_id em todas as tabelas)
- Sistema de planos e pagamentos (Stripe)
- Registro e onboarding de novos estabelecimentos
- Gestao de equipe (multiplos profissionais)
- Pagina publica por tenant (slug/subdominio)
- Painel administrativo
- Infraestrutura de producao

## Testing Status
- iteration_1: 43/43 pass
- iteration_2: 9/9 pass
- iteration_3: 39/39 pass
- iteration_4: 37/37 pass
- iteration_5: 100% frontend pass (dark mode mobile)
- iteration_7: 100% web-client dark mode pass (Home, Login, Booking)

## Notes
- WhatsApp e MOCKED - apenas loga mensagens no console
- Login mobile: Configurar IP local via "Configurar Servidor"
- Landing page servida em /app/landing-page/index.html
- Depoimentos na landing page sao ficticios (placeholders)
- Web-client roda em porta 3001 com proxy /api -> localhost:8001
