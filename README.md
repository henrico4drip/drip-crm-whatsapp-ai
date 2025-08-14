# Drip CRM - Sistema Inteligente de WhatsApp

## Descrição

Sistema CRM inteligente com integração WhatsApp Bot e análise de IA para gestão automatizada de clientes e tarefas.

## Funcionalidades

- 🤖 **WhatsApp Bot Automatizado**: Integração completa com WhatsApp Web
- 🧠 **Análise de IA**: Processamento inteligente de mensagens com OpenRouter
- 📊 **Dashboard Interativo**: Interface moderna com métricas em tempo real
- 👥 **Gestão de Clientes**: Sistema completo de CRM
- ✅ **Gestão de Tarefas**: Criação e acompanhamento automatizado
- 🔄 **Sincronização em Tempo Real**: Updates instantâneos via Firebase
- 📱 **Interface Responsiva**: Funciona perfeitamente em desktop e mobile

## Tecnologias

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Firebase Authentication
- React Query
- Framer Motion

### Backend
- Node.js + Express
- Firebase Admin SDK
- Venom-Bot (WhatsApp)
- OpenRouter AI
- Cron Jobs

## Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Firebase
- Conta OpenRouter

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm start
```

## Configuração

1. Configure as variáveis de ambiente do Firebase
2. Configure a chave da API do OpenRouter
3. Configure as credenciais do Firebase Admin

## Estrutura do Projeto

```
├── src/                 # Frontend React
│   ├── components/      # Componentes UI
│   ├── contexts/        # Contextos React
│   ├── hooks/          # Hooks customizados
│   ├── lib/            # Utilitários
│   ├── pages/          # Páginas
│   ├── services/       # Serviços API
│   └── types/          # Tipos TypeScript
├── backend/            # Backend Node.js
│   ├── app.js          # Servidor principal
│   ├── botManager.js   # Gerenciador WhatsApp
│   ├── aiService.js    # Serviços de IA
│   └── ...
└── public/             # Arquivos estáticos
```

## Licença

MIT License