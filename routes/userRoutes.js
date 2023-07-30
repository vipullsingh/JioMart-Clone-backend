const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// User signup route
router.post('/signup', userController.signup);

// User email verification route
router.get('/verify', userController.verifyEmail);

// User login route
router.post('/login', userController.login);

module.exports = router;
