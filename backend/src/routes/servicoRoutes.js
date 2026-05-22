const router = require('express').Router();
const servicoController = require('../controllers/servicoController');
router.get('/', servicoController.listar);
module.exports = router;