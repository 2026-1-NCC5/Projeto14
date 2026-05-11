const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define as rotas e qual função do controller irá executá-las
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;