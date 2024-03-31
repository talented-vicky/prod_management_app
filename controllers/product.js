const Product = require('../models/product');
const cloudinary = require('cloudinary').v2

// const urlPathDelete = require('../helper/url')
const { validationResult } = require('express-validator');
const { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } = require('../config/keys');

cloudinary.config({
    cloud_name: cloudinary_name,
    api_key: cloudinary_api_key,
    api_secret: cloudinary_api_secret
})

const technicalErrorCtr = (nexxx, err) => {
    const error = new Error(err)
    error.httpStatusCode = 500
    return nexxx(error) 
}
const item_per_page = 2;


/* 
ADMIN CONTROLLERS
*/
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-prod', {
        // the above is an ejs file in an admin folder
        title: 'Add Product',
        path: '/addEdit-product',
        // the above is the path in the nev.ejs file
        editing: false,
        // this is for => const editMode = req.query.edit boole
        errorPresent: false,
        addprodError: null,
        errorArray: []
    })
}

exports.postAddProduct = (req, res, next) => {
    const { name, lat, long } = req.body
    // const image = req.file
    let image
    const initImage = req.file.path

    const errors = validationResult(req)
    console.log(image)

    if(!image){
        return res.status(422).render('admin/edit-prod', {
            title: 'Add Product',
            path: '/addEdit-product',
            editing: false,
            errorPresent: true,
            addprodError: 'Attached file is not an image',
            prod: { name, lat, long },
            errorArray: []
        }) 
    }

    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-prod', {
            title: 'Add Product',
            path: '/addEdit-product',
            editing: false,
            errorPresent: true,
            addprodError: errors.array()[0].msg,
            prod: { title: title, price: price, description: des },
            errorArray: errors.array()
        })
    }   

    cloudinary.uploader.upload(
        initImage,
        (error, uploadedImg) => {
            if(error) {
                return res.status(422).render('admin/edit-prod', {
                    title: 'Add Product',
                    path: '/addEdit-product',
                    editing: false,
                    errorPresent: true,
                    addprodError: 'Error uploading image',
                    prod: { name, lat, long },
                    errorArray: []
                }) 
            }
            image = uploadedImg.secure_url
        }
    )
    const product = new Product({ 
        name, image,
        location: {
            type: String,
            coordinates: [ lat, long]
        },
        user: req.user 
        // user: req.user => mongoose understands to store just 
        // the user._id and not all values
    })
    // keys point at prod schema while values point at const variable defined
    product.save()
        .then(result => {
            console.log('Successfully created product')
            res.redirect('/')
        })
        .catch(err => technicalErrorCtr(next, err))
}

exports.getMyProduct = (req, res, next) => {
    const page = +req.query.page || 1
    let prodQty;
    Product.find()
        .countDocuments()
        .then(docCount => {
            prodQty = docCount
            return Product.find({userId: req.user._id}) // confirming if it's logged in user
                    .skip((page - 1) * item_per_page)
                    .limit(item_per_page)
            // check app.js file for user initialization (req.user = user)
            // .select('title price -_id')
            // now I'm fetching just title and price, _id is automatically fetched
            // so I had to exclude it if I didn't want to retrieve it 4rm database
            // .populate('userId')
            // the above is now the field I wanna display 4rm what I've selected        
        })
        .then(product => {
            res.render('admin/show-prod', {
                prods: product,
                title: 'Admin All Products',
                path: '/show-product',
                currentPage: page,
                prevPage: page - 1,
                nextPage: page + 1,
                hasNextpage: (page * item_per_page) < prodQty,
                semilastPage: Math.ceil(prodQty / item_per_page) - 1,
                lastPage: Math.ceil(prodQty / item_per_page)
            })
        })
        .catch(err => technicalErrorCtr(next, err))
}

exports.getEditProduct = (req, res, next) =>{
    const editMode = req.query.edit
    // check show-product.ejs file for query assignment
    if(!editMode){
        return res.redirect('/')
    }
    const productId = req.params.prodId

    Product.findById(productId)
        .then(product => {
            if(!product){
                res.redirect('/')
            }
            res.render('admin/edit-prod', {
                title: 'Edit Product',
                path: '/onlyEdit-product',
                editing: editMode,
                errorPresent: false,
                prod: product,
                addprodError: null,
                errorArray: []
            })
        })
        .catch(err => technicalErrorCtr(next, err))
    // remember we have access to all the key values in the ejs files
}

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId
    // I just fetched the id {name: productId, value: prod._id} 
    // (when on edit mode) from the hidden input in edit-product.ejs
    const updTitle = req.body.title
    const image = req.file
    const updPrice = req.body.price
    const updDes = req.body.description
    const errors = validationResult(req)
    
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-prod', {
            title: 'Edit Product',
            path: '/onlyEdit-product',
            editing: true,
            errorPresent: true,
            addprodError: errors.array()[0].msg, // displaying error
            errorArray: errors.array(), // searching through errors
            prod: { 
                title: updTitle, price: updPrice, description: updDes, 
                _id: prodId //which will now be re-available in form
            }, // keeping original user input
        })
    }    

    // getting to this stage means we made it past the validation
    Product.findById(prodId)
        .then(product => {
            // adding additional route protection peradventure a user
            // finds a way to get to the edit page of products not created
            // by him/her
            if(product.userId.toString() !== req.user._id.toString()){
                console.log('Unauthorized error, not permitted to edit product')
                return res.redirect('/')
            }
            product.title = updTitle 
            if(image){
                urlPathDelete.deteleFile(product.imageUrl)
                product.imageUrl = image.path
            } // if the user doesn't pick an image, url will be the old one
            product.price = updPrice
            product.description = updDes
            product.userId = req.user
            return product.save()
            // note I called save on the result "product" not on model "Product"
            .then(result => {
                console.log('Successfully updated product')
                res.redirect('/admin/show-product')
            })
        })
        .catch(err => technicalErrorCtr(next, err))
        // mongoose does a bts update anytime we call save on an existing obj
}

exports.deleteProduct = (req, res, next) => {
    // const productId = req.body.prodId
    // fetching prodId from the name field of the hidden input
    
    const productId = req.params.prodId
    Product.findById(productId)
        .then(prod => {
            if(!prod){
                return next(new Error('Product not found, sorry!'))
            }
            urlPathDelete.deteleFile(prod.imageUrl)
            return Product.deleteOne({_id: productId, userId: req.user._id})
        })
        .then(prod => {
            console.log('product successfully deleted')
            res.status(200).json({msg: "delete success!"})
        })
        .catch(err => res.status(500).json({msg: "server error deleting"}));
}




/* 
USER CONTROLLERS
*/
exports.showIndex = (req, res, next) => {
    const page = +req.query.page || 1//plus ensures I always have an int
    // fetched from param passed into index.ejs file (value after equal sign)
    let prodQty;

    Product.find()
        .countDocuments()
        .then(prodQuantity => {
            prodQty = prodQuantity
            return Product.find()
                .skip((page - 1) * item_per_page)
                .limit(item_per_page)
        })
        .then(product => {
            res.render('shop/index', {
                prods: product, 
                title: 'Index Page',
                path: '/',
                currentPage: page,
                nextPage: page + 1,
                prevPage: page - 1,
                hasNextpage: (page * item_per_page) < prodQty,
                // hasPrevpage: prodQty < 1,
                semilastPage: Math.ceil(prodQty / item_per_page) - 1,
                lastPage: Math.ceil(prodQty / item_per_page)
            })
        })
        .catch(err => technicalErrorCtr(next, err))
}

exports.showProducts = (req, res, next) => {
    const page = +req.query.page || 1
    let totalQty;
        
    Product.find()
        .countDocuments()
        .then(docCount => {
            totalQty = docCount
            return Product.find()
                .skip((page - 1) * item_per_page)
                .limit(item_per_page)
        })
        .then(product => {
            res.render('shop/prod-list', {
                prods: product, 
                title: 'Shop Page',
                path: '/user-products',
                currentPage: page,
                prevPage: page - 1,
                nextPage: page + 1,
                hasNextpage: (page * item_per_page) < totalQty,
                semilastPage: Math.ceil(totalQty / item_per_page) - 1,
                lastPage: Math.ceil(totalQty / item_per_page)
            })
        })
        .catch(err => technicalErrorCtr(next, err))
}

exports.showSingleProduct = (req, res, next) => {
    const productId = req.params.prodId
    Product.findById(productId)
        .then(product => {
            res.render('shop/prod-detail', {
                prod: product,
                title: product.title,
                path: '/user-products'
                // it'll seem as if we're still on products page
            })
        })
        .catch(err => technicalErrorCtr(next, err))
}