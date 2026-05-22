const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { autenticar, autorizarAdmin } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ========== ROTAS PÚBLICAS (não exigem token) ==========
app.use('/api/auth', require('./routes/authRoutes'));       // login e criação de admin
app.use('/api/clientes', require('./routes/clienteRoutes')); // listagem de clientes (pública)
app.use('/api/servicos', require('./routes/servicoRoutes')); // listagem de serviços (pública)
app.get('/', (req, res) => {
  res.json({ message: 'API Cabeleleila Leila funcionando!' });
});

// ========== ROTAS PROTEGIDAS (exigem token) ==========
app.use(autenticar); // todas as rotas abaixo deste ponto requerem autenticação

// Rotas de agendamento (qualquer usuário logado pode criar/alterar seu próprio)
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));

// Rotas gerenciais (apenas admin)
app.use('/api/relatorios', autorizarAdmin, require('./routes/relatorioRoutes'));

module.exports = app;