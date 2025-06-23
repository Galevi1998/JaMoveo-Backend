const express = require('express');
const router = express.Router();

const{
    search,
} = require('../controllers/searchController');
const protect = require("../middlewares/authMiddlewares");



router.get('/', register);



module.exports = router;