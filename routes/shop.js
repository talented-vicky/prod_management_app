const express = require('express');

const router = express.Router();

const shopCntr = require('../controllers/product');
const authCntr = require('../middleware/auth')

router.get('/', shopCntr.showIndex);

// the path in router has to match that in the nav.ejs file
router.get('/products', shopCntr.showProducts);

//prodId is what I'm fetching from the .ejs file
router.get('/products/:prodId', shopCntr.showSingleProduct);


module.exports = router;


