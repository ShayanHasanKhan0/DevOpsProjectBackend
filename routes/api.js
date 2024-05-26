/* Imports */
const { Router } = require('express')
const auth = require('../controllers/auth')
const imageUpload = require('../controllers/imageUpload')
const widget = require('../controllers/widget')
const passport = require('passport')
const checkout = require('../controllers/checkout');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const multer = require('multer')
const express = require('express')

// my
const customizequiz = require('../controllers/customizequiz')
const stats = require('../controllers/stats')
// 

const forgotPassword = require('../controllers/passwordReset')

/* Initialisations & Middlewares */
const router = Router()

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.status(401).send("Unauthorized");
}
const optionImageUploadStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './optionImage/');
    },
  
    filename: function(req, file, cb) {
        tempArr = (file.mimetype).split('/')
        cb(null, mongoose.Types.ObjectId().toString() + "." + tempArr[tempArr.length-1]);
    }
})
const optionImageUpdateStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './optionImage/');
    },
  
    filename: function(req, file, cb) {
        tempArr = (file.mimetype).split('/')
        cb(null, req.params.id + "." + tempArr[tempArr.length-1]);
    }
})
const productImageStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './productImage/');
    },  
    filename: function(req, file, cb) {
        tempArr = (file.mimetype).split('/')
        cb(null, req.params.id + "-" + mongoose.Types.ObjectId().toString() + "." + tempArr[tempArr.length-1]);
    }
})
const imageFilter = (req, file ,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'|| file.mimetype === 'image/svg'){
        cb(null, true)
    }
    else{
        cb(null, false)
    }
} 
const optionImageUpload = multer({ storage: optionImageUploadStorage, limits: { fileSize: 1024*1024*10 }, fileFilter: imageFilter })
const optionImageUpdate = multer({ storage: optionImageUpdateStorage, limits: { fileSize: 1024*1024*10 }, fileFilter: imageFilter })
const productImage = multer({ storage: productImageStorage, limits: { fileSize: 1024*1024*10 }, fileFilter: imageFilter })


// Braintree
const braintree = require('../controllers/braintree')

router.get('/check-subscription', bodyParser.json(), braintree.getDate.get)
router.get('/client_token', bodyParser.json(), braintree.getClientToken.get)
router.get('/get-payment-methods', bodyParser.json(), braintree.getPaymentMethods.get)
router.post('/add-payment-method', bodyParser.json(), braintree.addPaymentMethod.post)
router.post('/subscribe', bodyParser.json(), braintree.subscribe.post)
router.post('/remove-payment-method', bodyParser.json(), braintree.removePaymentMethod.post)
router.post('/cancel-braintree-subscription', bodyParser.json(), braintree.cancelsubscription.post)
// 


router.get('/initialise/:rootId', isAuthenticated, auth.forms.get.initialise)
router.get('/roots', isAuthenticated, auth.forms.get.roots)
// router.get('/node/:nodeId', isAuthenticated, auth.forms.get.node) /* Isnt being used rn */

router.post('/node/:editHasChild', isAuthenticated, bodyParser.json(), auth.forms.add.node)
router.post('/product/:rootId/:nodeId', isAuthenticated, productImage.single('productImage'), auth.forms.add.product) /* adding product to anode */
router.post('/node/image/:editHasChild', isAuthenticated, optionImageUpload.single('optionImage'), auth.forms.add.imageNode) /* adding node with image option */

router.patch('/node/:type', isAuthenticated, bodyParser.json(), auth.forms.update.node)
router.patch('/node/image/:rootId/:nodeId', isAuthenticated, optionImageUpdate.single('optionImage'), auth.forms.update.imageNode) /* updating image node */

router.delete('/node/:rootId/:parentId/:nodeId/:isRange', isAuthenticated, auth.forms.delete.node)
router.delete('/product/:nodeId/:productId', isAuthenticated, auth.forms.delete.product)

router.post('/logout', isAuthenticated, auth.logout.post)


// customize quiz
router.get('/customizequiz/:formid', isAuthenticated, bodyParser.json(), customizequiz.get)
router.post('/customizequiz/:formid', isAuthenticated, bodyParser.json(), customizequiz.post)

// stats
// router.get(['/stats/:id'], isAuthenticated, stats.get);
router.get('/initialisestats/:rootId', isAuthenticated, stats.get)



// router.delete(['/forms/:id', '/form/:id'], isAuthenticated, auth.forms.delete.node)
// router.delete('/delete/children/:id', isAuthenticated, auth.forms.delete.children)
// router.delete('/delete/product/:nodeId/:productId', isAuthenticated, auth.forms.delete.product)































router.use('/optionImage', express.static('optionImage'))
router.use('/productImage', express.static('productImage'))

router.post('/signUp', bodyParser.json(), auth.signUp.post)
router.post('/login', bodyParser.json(), auth.prompts, auth.verify, passport.authenticate('local'), auth.login.post)

// router.post(['/createquiz', '/chart'], isAuthenticated, bodyParser.json(), auth.userForm.post)

router.patch(['/createquiz', '/chart'], isAuthenticated, bodyParser.json(), auth.userForm.patch)




router.patch('/product-image-upload', isAuthenticated, productImage.single('productImage'), imageUpload.product.patch)



// stripe
// router.post('/create-customer', bodyParser.json(), checkout.createcustomer.post)
router.get('/subscription', isAuthenticated, bodyParser.json(), checkout.getDate.get)
// router.post('/stripe-webhook', express.raw({type: 'application/json'}), checkout.webhook.post)
router.post('/create-subscription', bodyParser.json(), checkout.createsubscription.post)

// reset password
router.post('/reset-password', bodyParser.json(), forgotPassword.reset.post)
router.post('/reset-password/:userId/:token', bodyParser.json(), forgotPassword.resetlink.post)
router.post('/reset-password-linkverified/:userId/:token', bodyParser.json(), forgotPassword.resetpassword.post)

// reset password from profile
router.post('/reset-password-profile/:userId', bodyParser.json(), forgotPassword.resetpasswordprofile.post)

router.get('/userprofile', isAuthenticated, bodyParser.json(), auth.profile.get)
router.post('/userprofile', isAuthenticated, bodyParser.json(), auth.profile.post)

//widget
router.get('/ppwidget/:id', bodyParser.json(), widget.get)
router.post('/ppwidget/:id', bodyParser.json(), widget.post)

router.use(function(err, req, res, next) {
    let userError = { email: '', password: ''}
    if(err.code === 11000){
        res.status(200).send(
            {
                msg: "User already exists"
            }
        )
    }
    else if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach( ({properties}) => {
            userError[properties.path] = properties.message
        })
        res.status(200).send(
            {
                msg: userError
            }
        )
    }
    else {
        console.log(err)
        res.status(200).send(
            {
                msg: "something went wrong we dont know"
            }
        )
    }
})

/* Exports */
module.exports = router