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

## 🗄️ Banco de Dados

O projeto utiliza **PostgreSQL**. Você pode criar o banco e as tabelas de duas formas:

### Opção 1 – Usando Prisma (recomendado)
```bash
# Crie o banco de dados
sudo -u postgres psql -c "CREATE DATABASE salao_db;"

# Execute as migrations
npx prisma migrate dev --name init
Opção 2 – Script SQL manual
Caso não queira usar o Prisma, execute os comandos SQL abaixo:

sql
-- Criar banco de dados
CREATE DATABASE salao_db;

-- Conectar ao banco
\c salao_db;

-- Criar tabelas
CREATE TABLE "Cliente" (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT NOT NULL,
    senha TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente'
);

CREATE TABLE "Servico" (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    duracao INTEGER NOT NULL,
    preco DOUBLE PRECISION NOT NULL,
    "imagemUrl" TEXT
);

CREATE TABLE "Agendamento" (
    id SERIAL PRIMARY KEY,
    data TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendente',
    "formaPagamento" TEXT,
    "motivoCancelamento" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "clienteId" INTEGER NOT NULL REFERENCES "Cliente"(id) ON DELETE CASCADE
);

CREATE TABLE "ItemAgendamento" (
    id SERIAL PRIMARY KEY,
    "agendamentoId" INTEGER NOT NULL REFERENCES "Agendamento"(id) ON DELETE CASCADE,
    "servicoId" INTEGER NOT NULL REFERENCES "Servico"(id) ON DELETE CASCADE,
    "statusServico" TEXT NOT NULL DEFAULT 'pendente',
    "precoNaHora" DOUBLE PRECISION NOT NULL
);
Após criar as tabelas, execute o seed para popular dados iniciais (clientes e serviços).

Dados iniciais (seed) – SQL
sql
-- Inserir serviços
INSERT INTO "Servico" (nome, duracao, preco) VALUES
('Corte feminino', 45, 50.0),
('Corte masculino', 30, 35.0),
('Tintura', 90, 120.0),
('Escova', 40, 40.0),
('Manicure', 30, 25.0);

-- Inserir clientes (senhas com hash bcrypt de '123456' e 'admin123')
-- Os hashes abaixo são exemplos; use bcrypt.hash() para gerar os seus.
INSERT INTO "Cliente" (nome, email, telefone, senha, role) VALUES
('Ana Silva', 'ana@email.com', '11999999999', '$2b$10$Jpc9byR2lj40Va...', 'cliente'),
('João Souza', 'joao@email.com', '11888888888', '$2b$10$Jpc9byR2lj40Va...', 'cliente'),
('Maria Oliveira', 'maria@email.com', '11777777777', '$2b$10$Jpc9byR2lj40Va...', 'cliente'),
('Admin Leila', 'admin@cabeleila.com', '11999999999', '$2b$10$97A0pav0ts9onmBwzAMzIu2DOXApxEWCcJAzaPGj5VIEgMzu/VCMS', 'admin');
Nota: Os hashes das senhas foram gerados com bcrypt.hash('123456', 10) e bcrypt.hash('admin123', 10). Em produção, você deve gerar os seus próprios hashes.

## 🧪 Testes

### Configuração do ambiente de teste
1. Crie um banco de dados separado: `salao_db_test`.
2. Configure o arquivo `.env.test` com a `DATABASE_URL` apontando para esse banco.
3. Execute as migrations: `npx prisma migrate deploy`
4. Rode os testes: `npm test`

### Comandos
```bash
# Executa todos os testes
npm test

# Executa um arquivo específico
npm test -- --testPathPattern=agendamentoService

# Executa com cobertura
npm run test:coverage
