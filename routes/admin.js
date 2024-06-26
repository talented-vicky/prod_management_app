const express = require('express');

const router = express.Router();

const prodController = require('../controllers/product')
const authController = require('../middleware/auth')
const { body } = require('express-validator')

// path is /admin/add-product => & has to match the href in the nav.ejs file
router.get('/edit-prod', authController, prodController.getAddProduct);

// here, its /admin/product
router.post('/product', 
    [
    body('name', 'product name should be at least 5 characters')
        .isLength({min: 5})
        .trim(),
    body('lat', 'Latitude should contain decimal places')
        .isFloat(),
    body('long', 'Longitude should contain decimal places')
        .isFloat(),
    ],
    authController, 
    prodController.postAddProduct
);

router.post('/comment/add/:prodId', authController, prodController.sendComment);

// this one is /admin/show-product
router.get('/show-prod', authController, prodController.getMyProduct);

router.get('/near-prod', authController, prodController.showNearProducts);

// this one is /admin/edit-product/:prodId
router.get('/edit-prod/:prodId', authController, prodController.getEditProduct)

router.post('/edit-prod', 
    [
    body('title', 'title length should be at least 5 characters')
        .isString()
        .isLength({min: 5})
        .trim(),
    body('price', 'price should be in decimal format')
        .isFloat(),
    body('description', 'Enter between 10 and 300 characters')
        .isLength({min: 10, max: 200})
        .trim()
    ],
    authController, 
    prodController.postEditProduct
)

// router.post('/delete-product/:prodId', prodController.postDeleteProduct)
// didn't use this because then I'd have to use the commented form show-product.ejs file
router.delete('/delete-product/:prodId', authController, prodController.deleteProduct)

module.exports = router