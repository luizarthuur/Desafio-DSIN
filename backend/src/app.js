const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { autenticar, autorizarAdmin } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ========== ROTAS PÚBLICAS ==========
app.use('/api/auth', require('./routes/authRoutes'));        // login
app.use('/api/clientes', require('./routes/clienteRoutes')); // GET e POST (cadastro)
app.use('/api/servicos', require('./routes/servicoRoutes')); // listagem pública
app.get('/', (req, res) => { res.json({ message: 'API funcionando' }); });

// ========== ROTAS PROTEGIDAS (token obrigatório) ==========
app.use(autenticar);

app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));

// Rotas administrativas (além do token, exigem papel de admin)
app.use('/api/relatorios', autorizarAdmin, require('./routes/relatorioRoutes'));

module.exports = app;