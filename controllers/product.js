const cloudinary = require('cloudinary').v2
// const admin = require('firebase-admin');

// const { firestore } = require('../config/firestore');

const Product = require('../models/product');
const Comment = require('../models/comment');
const User = require('../models/user')

// const urlPathDelete = require('../helper/url')
const { validationResult } = require('express-validator');
const { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } = require('../config/keys');
const { notifyUser } = require('../config/sendmail');


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

exports.postAddProduct = async (req, res, next) => {
    const { name, lat, long } = req.body
    let image
    const initImage = req.file.path

    const errors = validationResult(req)
    if(!initImage){
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
            prod: { name, lat, long },
            errorArray: errors.array()
        })
    } 

    await cloudinary.uploader.upload(
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
            "type": "Point",
            "coordinates": [ Number(long), Number(lat)]
        },
        user: req.user 
        // user: req.user => mongoose understands to store just 
        // the user._id and not all values
    })

    // // sync data to firestore
    // createfsDB = async () => {
    //     try {
    //         firestore()
    //         const userProducts = await Product.find({ user: req.user })
    
    //         const db = admin.firestore();
    //         const userRef = db.collection('users').doc(req.user.toString());
    
    //         const userSnp = userRef.get()
    //         if(!userSnp.exists){
    //             // user doesn't already exist, hence create product collection
    //             await userRef.set({ products: [] })
    //         }
            
    //         const batch = db.batch()
    //         const prodRef = userRef.collection('products')
            
    //         // push this product to firestore
    //         userProducts.forEach(prod => {
    //             const prodDocRef = prodRef.doc(prod._id.toString())
    //             batch.set(prodDocRef, {
    //                 "name": prod.name,
    //                 "image": prod.image,
    //                 "location": {
    //                     lat: prod.location.coordinates[1],
    //                     long: prod.location.coordinates[0]
    //                 },
    //                 "user": prod.user.toString(),
    //             })
    //         })
    //         await batch.commit()

            
    //         // if firestor operation succeeds, save into database
    //         const user = await User.findById(req.user)
    //         user.products.push(product)
    //         await user.save()
            
    //         const prod = await product.save()
    //         if(!prod){
    //             const error = new Error('Error creating product')
    //             error.httpStatusCode = 500
    //             return next(error) 
    //         }
    //     } catch (error) {
    //         console.log(error)
    //         throw error;
    //     }
    // }

    // createfsDB()

    // if firestor operation succeeds, save into database
    const user = await User.findById(req.user)
    user.products.push(product)
    await user.save()
    
    const prod = await product.save()
    if(!prod){
        const error = new Error('Error creating product')
        error.httpStatusCode = 500
        return next(error) 
    }
    
    console.log('Successfully created product')
    res.redirect('/')
}

exports.sendComment = async (req, res, next) => {
    const { comment } = req.body;
    const prodID = req.params.prodId;

    const sender = await User.findById(req.user)
    if(!sender){
        technicalErrorCtr(next, "User does not exist")
    }
    
    const product = await Product.findById(prodID)
    if(!product){
        technicalErrorCtr(next, "Product does not exist")
    }

    const owner = await User.findById(product.user)
    if(!owner){
        technicalErrorCtr(next, "Product owner no longer exists")
    }

    res.render('shop/success-msg', {
        prod: product,
        title: product.title,
        path: '/user-products',
        user: owner
        // it'll seem as if we're still on products page
    })

    const comm = new Comment({
        message: comment,
        user: req.user
    })
    owner.comments.push(comm)
    await owner.save()

    // now send mail
    notifyUser(sender.email, owner.email, product.name)
}

exports.getMyProduct = async (req, res, next) => {
    const page = +req.query.page || 1
    let prodQty;
    
    const docCount = await Product.find({user: req.user._id}).countDocuments()
    // counting only documents for currently logged in user
    if(!docCount){
        technicalErrorCtr(next, "Unable to get document count")
    }
    prodQty = docCount

    const product = await Product.find({user: req.user._id}) 
                .skip((page - 1) * item_per_page).limit(item_per_page)
    // the above is now the field I wanna display 4rm what I've selected
    if(!product){
        technicalErrorCtr(next, "No Product Found")
    }
        
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
}

exports.showNearProducts = async (req, res, next) => {
    const page = +req.query.page || 1
    let totalQty;

    const user = await User.findById(req.user)
    if(!user){
        technicalErrorCtr(next, "User Not Found in database")
    }
        
    const aggDocument = await Product.aggregate([
        {
            $geoNear: {
                near: user.address,
                distanceField: "distance",
                maxDistance: 20000,
                spherical: true
            }
        }
    ])
    const docCount = aggDocument.length
    if(!docCount){
        technicalErrorCtr(next, "Error finding document count")
    }       
    totalQty = docCount

    // get products near this user
    const nearProd = await Product.aggregate([
        {
            $geoNear: {
                near: user.address,
                distanceField: "distance",
                maxDistance: 20000,
                spherical: true
            }
        }
    ]).skip((page - 1) * item_per_page).limit(item_per_page)
    
    if(!nearProd){
        technicalErrorCtr(next, "Error finding product")
    }
    
    res.render('admin/near-prod', {
        prods: nearProd, 
        title: 'Products Near Me',
        path: '/near-product',
        currentPage: page,
        prevPage: page - 1,
        nextPage: page + 1,
        hasNextpage: (page * item_per_page) < totalQty,
        semilastPage: Math.ceil(totalQty / item_per_page) - 1,
        lastPage: Math.ceil(totalQty / item_per_page)
    })
}


exports.getEditProduct = async (req, res, next) =>{
    const editMode = req.query.edit
    // check show-product.ejs file for query assignment
    if(!editMode){
        return res.redirect('/')
    }
    const productId = req.params.prodId

    try {
        const product = await Product.findById(productId)
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

    } catch (error) {
        technicalErrorCtr(next, error)
    }
}

exports.postEditProduct = async (req, res, next) => {
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
    try {
        const product = await Product.findById(prodId)

        // check if it's userId or user in shopping app
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
        await product.save()

        // note I called save on the result "product" not on model "Product"
        console.log('Successfully updated product')
        res.redirect('/admin/show-product')

    } catch (error) {
        technicalErrorCtr(next, error)
    }
        
        // mongoose does a bts update anytime we call save on an existing obj
}

exports.deleteProduct = async (req, res, next) => {
    // const productId = req.body.prodId
    // fetching prodId from the name field of the hidden input
    
    const productId = req.params.prodId
    try {
        const prod = await Product.findById(productId)
        if(!prod){
            technicalErrorCtr(next, "Product Not Found")
        }

        urlPathDelete.deteleFile(prod.imageUrl)
        await Product.deleteOne({_id: productId, userId: req.user._id})
        
        res.status(200).json({msg: "delete success!"})
            
    } catch (error) {
        res.status(500).json({msg: "server error deleting", info: error});
    }
}




/* 
USER CONTROLLERS
*/
exports.showIndex = async (req, res, next) => {
    const page = +req.query.page || 1//plus ensures I always have an int
    // fetched from param passed into index.ejs file (value after equal sign)
    let prodQty;

    const prodQuantity = await Product.find().countDocuments()
    if(!prodQuantity){
        technicalErrorCtr(next, "Error findind document count")
    }
    prodQty = prodQuantity
    const product = await Product.find().skip((page - 1) * item_per_page).limit(item_per_page)

    if(!product){
        technicalErrorCtr(next, "Error finding product")
    }
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
}

exports.showProducts = async (req, res, next) => {
    const page = +req.query.page || 1
    let totalQty;
        
    const docCount = await Product.find().countDocuments()
    if(!docCount){
        technicalErrorCtr(next, "Error finding document count")
    }       
    totalQty = docCount
    const product = await Product.find().skip((page - 1) * item_per_page).limit(item_per_page)
    
    if(!product){
        technicalErrorCtr(next, "Error finding product")
    }
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
}

exports.showSingleProduct = async (req, res, next) => {
    const productId = req.params.prodId

    const product = await Product.findById(productId)
    if(!product){
        technicalErrorCtr(next, "Error finding product")
    }
    res.render('shop/prod-details', {
        prod: product,
        title: product.title,
        path: '/user-products'
        // it'll seem as if we're still on products page
    })
}