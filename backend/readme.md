# Backend – API Cabeleleila Leila

API REST para gerenciamento de agendamentos de um salão de beleza.

## Tecnologias
- Node.js (v22)
- Express
- PostgreSQL
- Prisma ORM (v5)
- JWT e bcryptjs
- CORS, dotenv, nodemon

## Pré‑requisitos
- Node.js 22+
- PostgreSQL 14+ (ou Docker)
- npm

## Instalação e execução

```bash
# Clone o repositório e acesse a pasta backend
git clone https://github.com/luizarthuur/Desafio-DSIN.git
cd Desafio-DSIN/backend

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com seu DATABASE_URL e JWT_SECRET

# Instale as dependências
npm install

# Crie o banco de dados (se não existir)
sudo -u postgres psql -c "CREATE DATABASE salao_db;"

# Execute as migrations e o seed
npx prisma migrate dev --name init
npx prisma db seed

# Inicie o servidor
npm run dev
O servidor estará em http://localhost:3000.

Estrutura de pastas
text
backend/
├── prisma/
│   ├── schema.prisma      # Modelos do banco
│   └── seed.js            # Dados iniciais
├── src/
│   ├── controllers/       # Lógica das rotas
│   ├── services/          # Regras de negócio
│   ├── routes/            # Definição de endpoints
│   ├── middleware/        # Autenticação e admin
│   ├── utils/             # Funções auxiliares
│   └── app.js             # Configuração do Express
├── server.js              # Ponto de entrada
├── .env                   # Variáveis (não commitado)
└── package.json
Endpoints principais
Autenticação
Método	Endpoint	Descrição
POST	/api/auth/login	Retorna token JWT
POST	/api/auth/criar-admin	Cria admin (apenas testes)
Clientes e Serviços (públicos)
| GET | /api/clientes | Lista todos os clientes |
| GET | /api/servicos | Lista todos os serviços |

Agendamentos (requer token)
Método	Endpoint	Permissão
POST	/api/agendamentos	cliente (próprio)
PUT	/api/agendamentos/:id	dono ou admin
GET	/api/agendamentos/historico?clienteId=&dataInicio=&dataFim=	dono ou admin
GET	/api/agendamentos/todos	admin
PATCH	/api/agendamentos/:id/confirmar	admin
PATCH	/api/agendamentos/itens/:itemId/status	admin (status serviço)
PATCH	/api/agendamentos/:id/cancelar	dono ou admin
Relatórios (admin)
| GET | /api/relatorios/desempenho-semanal?data=YYYY-MM-DD | Indicadores semanais |

Regras de negócio
Alteração/cancelamento: cliente só pode modificar agendamentos com ≥2 dias de antecedência.

Sugestão de mesma semana: ao agendar, se o mesmo cliente já tiver um agendamento naquela semana, o sistema sugere usar a mesma data.

Conflito de horário: não é permitido criar/alterar agendamento para um horário já ocupado por outro (status pendente ou confirmado).

Admin: ignora todas as restrições de tempo e pode gerenciar qualquer agendamento.

Testes manuais (curl)
bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cabeleila.com","senha":"admin123"}'

# Listar todos os agendamentos (admin)
TOKEN="<token_recebido>"
curl -X GET http://localhost:3000/api/agendamentos/todos \
  -H "Authorization: Bearer $TOKEN"
Melhorias futuras
Refresh token e logout

Validações com Joi

Testes unitários com Jest

Documentação Swagger

Containerização com Docker

