const express = require('express');
const router = express.Router();

const{
    searchSongs,
    scrapeSongPage
} = require('../controllers/searchController');
const protect = require("../middlewares/authMiddlewares");



router.get('/',protect, searchSongs);
router.post("/scrape",protect, scrapeSongPage);




module.exports = router;