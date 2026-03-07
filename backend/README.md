# 💈 Barbershop Manager API

Sistema completo de gerenciamento de barbearia com:
- 📱 App Mobile (Expo) para barbeiros
- 🌐 App Web para clientes agendarem
- 🔔 Notificações Push em tempo real
- 💰 Controle de caixa
- 📊 Relatórios financeiros

## 🚀 Configuração Inicial

### 1. Configurar NeonDB

1. Crie uma conta em [Neon.tech](https://neon.tech)
2. Crie um novo projeto PostgreSQL
3. Copie a connection string (formato: `postgresql://user:password@host.neon.tech/database`)
4. Edite `/app/backend/.env` e atualize `DATABASE_URL`:

```env
DATABASE_URL=postgresql+asyncpg://SEU_USER:SUA_SENHA@SEU_HOST.neon.tech/barbershop?sslmode=require
```

### 2. Configurar Expo Push Notifications (Opcional)

1. Crie uma conta em [Expo.dev](https://expo.dev)
2. Vá em Project Settings → Push Notifications
3. Copie o Access Token
4. Edite `/app/backend/.env` e adicione:

```env
EXPO_ACCESS_TOKEN=seu_token_aqui
```

### 3. Instalar Dependências

```bash
cd /app/backend
pip install -r requirements.txt
```

### 4. Iniciar o Backend

```bash
sudo supervisorctl restart backend
```

## 📋 Estrutura do Backend

### Modelos de Dados

- **Users**: Usuários (barbeiros e clientes)
- **Services**: Serviços oferecidos
- **Products**: Produtos da barbearia
- **Appointments**: Agendamentos
- **CashRegister**: Controle de caixa
- **ServiceHistory**: Histórico de atendimentos
- **PushTokens**: Tokens para notificações

### Endpoints Principais

#### Autenticação
- `POST /api/auth/session` - Login com Google
- `GET /api/auth/me` - Info do usuário atual
- `POST /api/auth/logout` - Logout
- `POST /api/auth/promote-to-barber` - Promover para barbeiro

#### Serviços
- `POST /api/services` - Criar serviço
- `GET /api/services` - Listar serviços
- `PUT /api/services/{id}` - Atualizar serviço
- `DELETE /api/services/{id}` - Deletar serviço

#### Produtos
- `POST /api/products` - Criar produto
- `GET /api/products` - Listar produtos
- `PUT /api/products/{id}` - Atualizar produto
- `DELETE /api/products/{id}` - Deletar produto

#### Agendamentos
- `POST /api/appointments` - Criar agendamento
- `GET /api/appointments` - Listar agendamentos
- `POST /api/appointments/{id}/confirm` - Confirmar
- `POST /api/appointments/{id}/cancel` - Cancelar
- `POST /api/appointments/{id}/complete` - Completar

#### Caixa
- `POST /api/cash-register/open` - Abrir caixa
- `POST /api/cash-register/close` - Fechar caixa
- `GET /api/cash-register/current` - Caixa atual
- `GET /api/cash-register/history` - Histórico

#### Histórico & Relatórios
- `POST /api/service-history` - Adicionar histórico
- `GET /api/service-history/client/{id}` - Histórico do cliente
- `GET /api/service-history/reports/financial?period=daily` - Relatório financeiro

#### Push Notifications
- `POST /api/push-tokens/register` - Registrar token
- `DELETE /api/push-tokens/deactivate` - Desativar tokens

## 🧪 Testando a API

```bash
# Health check
curl http://localhost:8001/api/health

# Listar serviços (sem auth)
curl http://localhost:8001/api/services

# Ver documentação interativa
# Abra: http://localhost:8001/docs
```

## 🔐 Autenticação

O sistema usa **Emergent Google OAuth** para autenticação.

**Fluxo:**
1. Cliente redireciona para: `https://auth.emergentagent.com/?redirect=YOUR_REDIRECT_URL`
2. Após login, usuário retorna com `#session_id=...` na URL
3. Frontend chama `POST /api/auth/session` com o `session_id`
4. Backend retorna `session_token` e configura cookie
5. Todas as próximas requisições usam o cookie ou header `Authorization: Bearer {token}`

## 📱 App Mobile

O app mobile está em `/app/frontend` e será desenvolvido com:
- Expo Router para navegação
- React Native components
- Notificações Push
- Upload de fotos (base64)

## 🎯 Próximos Passos

1. Configure o NeonDB e atualize o .env
2. Teste os endpoints da API
3. Implemente o app mobile
4. Configure notificações push
5. Desenvolva o app web para clientes

## 📚 Tecnologias

- **Backend**: FastAPI + SQLAlchemy + AsyncPG
- **Database**: NeonDB (PostgreSQL)
- **Auth**: Emergent Google OAuth
- **Notifications**: Expo Push Notifications
- **Mobile**: Expo + React Native
- **Web**: React (próximo passo)
