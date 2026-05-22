const router = require('express').Router();
const relatorioController = require('../controllers/relatorioController');

router.get('/desempenho-semanal', relatorioController.desempenhoSemanal);

module.exports = router;