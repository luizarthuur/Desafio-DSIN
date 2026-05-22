1. Visão geral
API REST para gerenciamento de agendamentos de um salão de beleza, desenvolvida como parte do teste prático para a vaga de Desenvolvedor na DSIN.
Atende aos requisitos fundamentais (agendamento de múltiplos serviços, alteração com regra de 2 dias, histórico por período, sugestão de mesma semana) e diferenciais (parte operacional e gerencial, autenticação JWT com papéis de admin/cliente).

2. Tecnologias utilizadas
Node.js (v22) – plataforma JavaScript

Express – framework web

PostgreSQL – banco de dados relacional

Prisma ORM (v5) – modelagem, migrations e cliente de banco

JSON Web Token (JWT) – autenticação

bcryptjs – hashing de senhas (opcional)

CORS – permissão de acesso cross-origin

Nodemon – reinicialização automática em desenvolvimento

3. Pré-requisitos
Node.js 22+ instalado

PostgreSQL 14+ instalado e rodando localmente (ou via Docker)

Gerenciador de pacotes npm

(Opcional) Postman, Insomnia ou curl para testar

4. Instalação e execução
4.1. Clonar o repositório
bash
git clone https://github.com/seu-usuario/cabeleleila-leila.git
cd cabeleleila-leila/backend
4.2. Configurar variáveis de ambiente
Crie um arquivo .env na raiz do backend com o seguinte conteúdo:

env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/salao_db"
JWT_SECRET="chave_super_secreta_para_jwt"
PORT=3000
Ajuste SUA_SENHA para a senha do seu usuário PostgreSQL.

4.3. Instalar dependências
bash
npm install
4.4. Criar o banco de dados (se ainda não existir)
Acesse o PostgreSQL e crie o banco:

bash
sudo -u postgres psql
CREATE DATABASE salao_db;
\q
4.5. Executar migrations e seed
bash
npx prisma migrate dev --name init
npx prisma db seed
O seed irá criar:

Serviços (corte feminino, masculino, tintura, escova, manicure)

Clientes comuns (Ana, João, Maria) – senha: 123456

Administrador (email: admin@cabeleila.com, senha: admin123)

4.6. Iniciar o servidor
bash
npm run dev
O servidor estará rodando em http://localhost:3000.

5. Estrutura de pastas (backend)
text
backend/
├── prisma/
│   ├── schema.prisma          # Modelagem das tabelas
│   └── seed.js                # Dados iniciais
├── src/
│   ├── controllers/           # Lógica de requisição/resposta
│   ├── services/              # Regras de negócio
│   ├── routes/                # Definição dos endpoints
│   ├── middleware/            # Autenticação e autorização
│   ├── utils/                 # Funções auxiliares (datas)
│   └── app.js                 # Configuração do Express
├── server.js                  # Ponto de entrada
├── .env                       # Variáveis de ambiente (não commitado)
└── package.json
6. Endpoints da API
6.1. Autenticação
Método	Endpoint	Descrição	Acesso
POST	/api/auth/login	Retorna token JWT	público
POST	/api/auth/criar-admin	Cria usuário admin (teste)	apenas testes
Exemplo de login (cliente ou admin):

json
// POST /api/auth/login
{
  "email": "admin@cabeleila.com",
  "senha": "admin123"
}
Resposta (sucesso):

json
{
  "token": "eyJhbGc...",
  "usuario": {
    "id": 4,
    "nome": "Administrador",
    "email": "admin@cabeleila.com",
    "role": "admin"
  }
}
6.2. Clientes e Serviços (públicos)
Método	Endpoint	Descrição
GET	/api/clientes	Lista todos os clientes
GET	/api/servicos	Lista todos os serviços
6.3. Agendamentos (protegidos – token obrigatório)
Para todas as requisições abaixo, enviar header:
Authorization: Bearer <token>

Método	Endpoint	Descrição	Permissão
POST	/api/agendamentos	Cria um novo agendamento (múltiplos serviços)	cliente (próprio)
PUT	/api/agendamentos/:id	Altera data/hora. Cliente só se faltar ≥2 dias; admin sempre	cliente (dono) / admin
GET	/api/agendamentos/historico?clienteId=&dataInicio=&dataFim=	Histórico do cliente no período	cliente (próprio) / admin
GET	/api/agendamentos/todos	Lista todos os agendamentos (completo)	admin
PATCH	/api/agendamentos/:id/confirmar	Confirma um agendamento	admin
PATCH	/api/agendamentos/itens/:itemId/status	Altera status de um serviço específico (pendente/em_andamento/concluído)	admin
Exemplo de criação de agendamento:

json
// POST /api/agendamentos
{
  "clienteId": 1,
  "data": "2026-05-25",
  "horaInicio": "14:00",
  "servicosIds": [1, 3]
}
Resposta (inclui possível sugestão de reagendar na mesma semana):

json
{
  "agendamento": { ... },
  "sugestao": {
    "mensagem": "Você já tem agendamento em 22/05/2026. Deseja usar a mesma data?",
    "dataSugerida": "2026-05-22T00:00:00.000Z"
  }
}
6.4. Relatórios gerenciais (protegido – apenas admin)
Método	Endpoint	Descrição
GET	/api/relatorios/desempenho-semanal?data=YYYY-MM-DD	Estatísticas da semana (receita, top serviços, etc.)
Exemplo de resposta:

json
{
  "semana": { "inicio": "2026-05-18", "fim": "2026-05-24" },
  "totalAgendamentos": 3,
  "receitaTotal": 205.0,
  "servicosMaisSolicitados": [
    { "nome": "Corte feminino", "quantidade": 2 },
    { "nome": "Tintura", "quantidade": 1 }
  ],
  "cancelamentos": 0,
  "confirmados": 1,
  "pendentes": 2
}
7. Decisões técnicas importantes
Arquitetura em camadas (controllers/services): facilita testes e manutenção.

Prisma ORM: migrations versionadas e client type-safe, evitando SQL injetável.

Regra de 2 dias implementada no service, com override para admin.

Sugestão de mesma semana: calculada com getWeekStart (segunda-feira como início da semana).

Autenticação JWT com papéis (role): cliente comum só pode acessar seus próprios agendamentos; admin tem poderes totais.

CORS liberado para desenvolvimento – em produção deve ser restrito.

Tratamento de erros com mensagens amigáveis e códigos HTTP apropriados (400, 401, 403, 404, 500).

8. Como testar manualmente
8.1. Testar com curl
bash
# Login admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cabeleila.com","senha":"admin123"}'

# Copiar token e usar nas próximas chamadas
TOKEN="seu_token_aqui"

# Listar todos os agendamentos
curl -X GET http://localhost:3000/api/agendamentos/todos \
  -H "Authorization: Bearer $TOKEN"

# Criar agendamento (cliente 1)
curl -X POST http://localhost:3000/api/agendamentos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"clienteId":1,"data":"2026-05-25","horaInicio":"15:00","servicosIds":[1,2]}'
8.2. Testar com Postman
Crie uma requisição POST /api/auth/login para obter o token.

Em todas as outras requisições, vá na aba Authorization → Bearer Token e cole o token.

Teste os endpoints listados acima.

9. Possíveis melhorias futuras
Implementar refresh token e logout.

Adicionar validação mais robusta com Joi ou Yup.

Criar endpoint para cancelamento de agendamento.

Adicionar testes unitários com Jest.

Documentação interativa com Swagger.

Containerização com Docker.

10. Licença e contato
Projeto desenvolvido como parte do processo seletivo da DSIN.
Autor: Luiz Arthur – luizarthurwinter@gmail.com
Repositorio - https://github.com/luizarthuur/Desafio-DSIN