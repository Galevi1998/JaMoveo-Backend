const express = require('express');
const router = express.Router();

const{
    register,
    login,
    getMe,
    refreshToken,
    logout
} = require('../controllers/authController');
const protect = require("../middlewares/authMiddlewares");



router.post('/signup', register);
router.post('/signin', login);
router.get('/me', protect,getMe);
router.get('/refresh',refreshToken)
router.post('/logout', protect, logout);


module.exports = router;