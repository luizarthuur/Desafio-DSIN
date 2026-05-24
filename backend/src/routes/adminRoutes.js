const router = require('express').Router();
const adminController = require('../controllers/adminController');
const { autenticar, autorizarAdmin } = require('../middleware/authMiddleware');

router.use(autenticar, autorizarAdmin);

router.get('/clientes', adminController.listarClientes);
router.put('/clientes/:id', adminController.atualizarCliente);
router.delete('/clientes/:id', adminController.deletarCliente);

router.get('/servicos', adminController.listarServicosAdmin);
router.post('/servicos', adminController.criarServico);
router.put('/servicos/:id', adminController.atualizarServico);
router.delete('/servicos/:id', adminController.deletarServico);

router.patch('/agendamentos/:id/cancelar', adminController.cancelarAgendamento);

module.exports = router;