const router = require('express').Router();
const agendamentoController = require('../controllers/agendamentoController');
const { autorizarAdmin } = require('../middleware/authMiddleware');

router.post('/', agendamentoController.criar);
router.put('/:id', agendamentoController.alterar);
router.get('/historico', agendamentoController.historico);
router.patch('/:id/cancelar', agendamentoController.cancelar);

router.get('/todos', autorizarAdmin, agendamentoController.listarTodos);
router.patch('/:id/confirmar', autorizarAdmin, agendamentoController.confirmar);
router.patch('/itens/:itemId/status', autorizarAdmin, agendamentoController.atualizarStatusItem);

module.exports = router;