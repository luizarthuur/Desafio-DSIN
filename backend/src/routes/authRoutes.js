const router = require('express').Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/criar-admin', authController.criarAdmin); // remover depois

module.exports = router;