const router = require('express').Router();
const clienteController = require('../controllers/clienteController');
router.get('/', clienteController.listar);
router.post('/', clienteController.criar); 
module.exports = router;