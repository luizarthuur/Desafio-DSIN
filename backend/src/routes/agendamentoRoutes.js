const router = require('express').Router();
const agendamentoController = require('../controllers/agendamentoController');

router.post('/', agendamentoController.criar);
router.put('/:id', agendamentoController.alterar);
router.get('/historico', agendamentoController.historico);
router.get('/todos', agendamentoController.listarTodos);
router.patch('/:id/confirmar', agendamentoController.confirmar);
router.patch('/itens/:itemId/status', agendamentoController.atualizarStatusItem);

module.exports = router;