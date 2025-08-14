# Drip CRM WhatsApp AI

Um sistema CRM integrado com WhatsApp que utiliza Inteligência Artificial para gerar sugestões automáticas de respostas e gerenciar clientes de forma eficiente.

## 🚀 Funcionalidades

- **Integração WhatsApp**: Conecta com WhatsApp Business usando Venom Bot
- **IA Generativa**: Gera sugestões de respostas usando OpenRouter API
- **Gerenciamento de Clientes**: Sistema completo de CRM
- **Análise Retroativa**: Processa mensagens históricas automaticamente
- **Dashboard Intuitivo**: Interface moderna construída com React e Tailwind CSS
- **Autenticação Firebase**: Sistema seguro de login e gerenciamento de usuários

## 🛠️ Tecnologias

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Venom Bot (WhatsApp)
- OpenRouter API (IA)

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Firebase SDK
- React Router
- Tanstack Query

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- Conta Firebase
- Conta OpenRouter
- WhatsApp Business

### Backend

1. Clone o repositório:
```bash
git clone https://github.com/henrico4drip/drip-crm-whatsapp-ai.git
cd drip-crm-whatsapp-ai
```

2. Instale as dependências do backend:
```bash
cd backend
npm install
```

3. Configure as variáveis de ambiente:
- Adicione suas credenciais do Firebase em `firebase-service-account.json`
- Configure a chave da OpenRouter API no `aiService.js`

4. Inicie o servidor backend:
```bash
npm start
```

### Frontend

1. Instale as dependências do frontend:
```bash
npm install
```

2. Configure o Firebase:
- Atualize as configurações em `src/lib/firebase.ts`

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔧 Configuração

### Firebase
1. Crie um projeto no Firebase Console
2. Ative Authentication (Email/Password)
3. Ative Firestore Database
4. Baixe as credenciais de serviço para o backend
5. Configure as credenciais do SDK web para o frontend

### OpenRouter
1. Crie uma conta em [OpenRouter](https://openrouter.ai/)
2. Obtenha sua chave API
3. Configure no arquivo `backend/aiService.js`

### WhatsApp
1. Configure um número de WhatsApp Business
2. Escaneie o QR code gerado pela aplicação
3. O bot será iniciado automaticamente

## 📱 Como Usar

1. **Login**: Acesse a aplicação e faça login com suas credenciais
2. **Configurar WhatsApp**: Adicione seu número comercial nas configurações
3. **Escanear QR Code**: Use o WhatsApp para escanear o código QR
4. **Gerenciar Clientes**: Visualize clientes e tarefas no dashboard
5. **Responder Mensagens**: Use as sugestões de IA para responder clientes

## 🏗️ Estrutura do Projeto

```
drip-crm-whatsapp-ai/
├── backend/
│   ├── app.js              # Servidor Express principal
│   ├── botManager.js       # Gerenciamento do bot WhatsApp
│   ├── aiService.js        # Integração com IA
│   ├── firebaseService.js  # Configuração Firebase
│   └── package.json
├── src/
│   ├── components/         # Componentes React
│   ├── contexts/          # Contextos (Auth, etc.)
│   ├── lib/               # Utilitários e configurações
│   ├── pages/             # Páginas da aplicação
│   └── types/             # Definições TypeScript
├── package.json
└── README.md
```

## 🔒 Segurança

- Nunca commite credenciais sensíveis
- Use variáveis de ambiente para configurações
- Mantenha as chaves API seguras
- Configure regras de segurança no Firestore

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Desenvolvido com ❤️ para automatizar e otimizar o atendimento ao cliente via WhatsApp**