# Cabeleleila Leila – Sistema de Agendamento para Salão de Beleza

Solução completa para gerenciamento de agendamentos online, desenvolvida como teste prático para a vaga de Desenvolvedor na DSIN.

- **Backend**: API REST em Node.js + Express + Prisma + PostgreSQL
- **Frontend**: Aplicação React com TypeScript + Vite

## 🚀 Como executar o projeto completo

### Pré‑requisitos
- Node.js 22+
- PostgreSQL 14+ (local ou Docker)
- npm

### 1. Backend
```bash
cd backend
cp .env.example .env   # ajuste as variáveis (veja backend/README.md)
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
O servidor estará em http://localhost:3000.

2. Frontend
bash
cd frontend
npm install
npm run dev
A aplicação estará em http://localhost:5173.

3. Credenciais de teste
Perfil	E‑mail	Senha
Admin	admin@cabeleila.com	admin123
Cliente (Ana)	ana@email.com	123456
📚 Documentação detalhada
Backend – endpoints, autenticação, regras de negócio

Frontend – componentes, rotas, integração com API

🧪 Demonstração
Prints das telas: /screenshots

Vídeo de funcionamento: /demo/video.mp4

✨ Funcionalidades implementadas
Fundamentais
Agendamento de um ou mais serviços

Regra de alteração/cancelamento com 2 dias de antecedência

Histórico por período (com filtro de datas)

Sugestão de reagendamento para a mesma semana

Diferenciais (operacionais e gerenciais)
Administrador pode alterar/cancelar qualquer agendamento

Agenda semanal com navegação por setas e seletor de data

Confirmação de agendamentos e gerenciamento de status individual de serviços

Dashboard gerencial com indicadores semanais (receita, top serviços, distribuição de status)

Autenticação e autorização
Login com JWT

Dois perfis: cliente e admin

Rotas protegidas e controle de acesso baseado em papel

🛠️ Tecnologias utilizadas
Backend

Node.js + Express

PostgreSQL + Prisma ORM

JSON Web Token (JWT) + bcryptjs

CORS, dotenv, nodemon

Frontend

React 18 + TypeScript

Vite (builder)

React Router DOM

Axios

React Icons

📄 Licença
Projeto desenvolvido para fins de avaliação técnica.
Autor: Luiz Arthur