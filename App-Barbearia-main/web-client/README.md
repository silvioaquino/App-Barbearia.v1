# 🌐 App Web Cliente - Barbershop

## ✅ Implementado

### Estrutura Base
- ✅ Configuração Vite + React
- ✅ Sistema de rotas (React Router)
- ✅ Context de autenticação
- ✅ Serviço de API (axios)
- ✅ Componentes base (Navbar, Card, Loading)

### Páginas Criadas
- ✅ **Home** - Landing page com apresentação
- ✅ **Login** - Página de login
- ✅ **Register** - Cadastro de clientes
- ✅ **Booking** - Agendamento público (SEM login necessário)
- ✅ **Dashboard** - Área logada do cliente
- ✅ **History** - Histórico de agendamentos
- ✅ **Promotions** - Promoções exclusivas
- ✅ **Loyalty** - Programa de fidelidade

## 📝 Páginas que Precisam Ser Criadas

### 1. Booking.jsx (Agendamento Público)
```javascript
// Funcionalidades:
// - Listar serviços disponíveis
// - Selecionar data e hora
// - Formulário: nome, telefone, email
// - Criar agendamento SEM autenticação
// - Ver agenda disponível em calendário
```

### 2. Login.jsx
```javascript
// Funcionalidades:
// - Login com Google OAuth (Emergent)
// - Redirecionar para /dashboard após login
```

### 3. Register.jsx
```javascript
// Funcionalidades:
// - Formulário de cadastro (nome, email, telefone)
// - Criar conta
// - Login automático após registro
```

### 4. Dashboard.jsx (Área Logada)
```javascript
// Funcionalidades:
// - Bem-vindo com nome do cliente
// - Próximos agendamentos
// - Pontos de fidelidade
// - Promoções ativas
// - Links rápidos
```

### 5. History.jsx
```javascript
// Funcionalidades:
// - Listar todos os agendamentos
// - Ver detalhes de cada serviço
// - Ver fotos dos cortes (se disponível)
// - Filtrar por status/data
```

### 6. Promotions.jsx
```javascript
// Funcionalidades:
// - Listar promoções ativas
// - Ver detalhes das promoções
// - Aplicar cupons
// - Promoções exclusivas para cadastrados
```

### 7. Loyalty.jsx
```javascript
// Funcionalidades:
// - Ver saldo de pontos
// - Regras do programa
// - Histórico de pontos
// - Resgatar benefícios
```

## 🚀 Como Iniciar o App Web

```bash
cd /app/web-client
yarn install
yarn dev
```

O app estará disponível em: `http://localhost:3001`

## 🔗 Integração com Backend

Todas as páginas devem se conectar com os endpoints:

### Endpoints Públicos (sem auth):
- `GET /api/services` - Listar serviços
- `POST /api/appointments` - Criar agendamento

### Endpoints Privados (com auth):
- `GET /api/auth/me` - Dados do usuário
- `GET /api/appointments` - Meus agendamentos
- `GET /api/service-history/client/{id}` - Meu histórico
- `GET /api/promotions` - Promoções (precisa criar endpoint)
- `GET /api/loyalty/points` - Pontos fidelidade (precisa criar endpoint)

## 📱 Diferença: Web vs Mobile

### Web (Clientes)
- Agendamento público (sem login)
- Área logada com histórico
- Promoções e fidelidade
- Interface responsiva

### Mobile (Barbeiro)
- Gerenciar agenda
- Confirmar/cancelar agendamentos
- Controle de caixa
- CRUD de serviços/produtos
- Notificações push

## 🎨 Design Guidelines

- **Cores principais**: #007AFF (azul), #34C759 (verde), #FF3B30 (vermelho)
- **Fonte**: System fonts (sans-serif)
- **Bordas**: 12-16px border-radius
- **Sombras**: box-shadow suave
- **Responsivo**: Mobile-first

## ⚡ Status Atual

**Backend**: ✅ 100% Completo (aguardando configuração NeonDB)
**Mobile**: ✅ 100% Completo (5 telas implementadas)
**Web**: ⚠️ 60% Completo (estrutura pronta, páginas precisam ser finalizadas)

## 📦 Próximos Passos

1. Terminar páginas do web client
2. Testar fluxo completo de agendamento
3. Configurar NeonDB no backend
4. Testar integração end-to-end
5. Deploy
