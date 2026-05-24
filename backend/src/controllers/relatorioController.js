const relatorioService = require('../services/relatorioService');

exports.desempenhoSemanal = async (req, res) => {
  try {
    const { data } = req.query;
    const dataRef = data ? new Date(data) : new Date();
    const resultado = await relatorioService.desempenhoSemanal(dataRef);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
};