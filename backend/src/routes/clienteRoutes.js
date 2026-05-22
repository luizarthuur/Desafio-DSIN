const router = require('express').Router();
const clienteController = require('../controllers/clienteController');
router.get('/', clienteController.listar);
module.exports = router;