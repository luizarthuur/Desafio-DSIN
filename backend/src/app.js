const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API Cabeleleila Leila funcionando!' });
});

app.use('/api/relatorios', require('./routes/relatorioRoutes'));

module.exports = app;