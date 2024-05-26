/* Imports */
const user = require('../models/user.js')
const userForm = require('../models/userForm.js');
const bcrypt = require('bcrypt')
const account = require('../models/account.js');
require('dotenv').config()

// braintree
const braintree = require("braintree");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "qcj7mbyc9y6t637d",
  publicKey: "yvkmmrtv928gw2d4",
  privateKey: "fe7d5c8f8727223160d4ab60bd186900"
});


// const stripe = require("stripe")(process.env.requiredSTRIPE_SECRET_KEY);
/* Exports */
/* SignUp Controller Body */
module.exports.signUp = {
    post: async (req, res, next) => {
        console.log("hitting signup")
        try{
            if(req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, 10)
            }
            await user.create(req.body).then(                
                async (createdUser) => {
                    console.log("user created")
                    await gateway.customer.create({ firstName: createdUser.email, email: createdUser.email }).then(
                        async (createdCustomer) =>{
                            console.log("braintree user created")
                            // console.log(createdCustomer)
                            const date = new Date();
                            date.setDate(date.getDate());
                            obj = {
                                userId: createdUser._id.toString(),
                                subscriptionService:{
                                    braintree:{
                                        braintreeCusID: createdCustomer.customer.id.toString()
                                    }
                                },
                                endDate: date
                            }
                            // console.log(obj)
                            await account.create(obj).then(
                                async (createdAccount) => {
                                    console.log("account created")
                                    await userForm.create( { "userId": createdUser._id.toString()} ).then(
                                        () => {
                                            console.log("userform created")
                                            res.status(201).send({})
                                        }
                                    )
                                    // (createdAccount)=>{                                                                    
                                        /* res.status(201).send(createdUser) */
                                    // }
                                }
                            ).catch(next)
                        }
                    )
                }
            ).catch(next)
        }
        catch{
            next
        }
    }
}

module.exports.login = {
    post: async (req, res, next) => {
        
        const uID = req.user._id.toString();
        if(uID){
            account.findOne( { userId: uID } ).then(
                (obj) => {
                    res.status(200).send({
                        userId: req.user.id,
                        braintreeCusID: obj.subscriptionService.braintree.braintreeCusID
                    })
                }
            )
        }
    }
}

module.exports.logout = {
    post: async (req, res, next) => {
        req.logout()
        req.session.destroy();
        res.clearCookie('app.sid');
        res.status(200).send()
    }
}

module.exports.profile = {
    get: async (req, res, next) => {        
        temp = {
            email : "",
            fname : "",
            lname : "",
            homeAddress : "",
            city : "",
            country : "",
            postalcode : ""
        }
        await user.findOne({_id: req.user._id.toString()}).then(async(obj)=>{
            temp.email = obj.email
            await account.findOne({userId: req.user._id.toString()}).then( async(obj)=>{
                temp.fname = obj.fname
                temp.lname = obj.lname
                temp.homeAddress = obj.homeAddress
                temp.city = obj.city
                temp.country = obj.country
                temp.postalcode = obj.postalcode
            }).then(
                ()=>{
                    res.status(200).send(temp)
                }
            )
        })
    },
    post: async (req, res, next) => {
        q = req.body
        if((q.email==="" || q.email!=="") &&
            (q.fname==="" || q.fname!=="") &&
            (q.lname==="" || q.lname!=="") &&
            (q.homeAddress==="" || q.homeAddress!=="") &&
            (q.city==="" || q.city!=="") &&
            (q.country==="" || q.country!=="") &&
            (q.postalcode==="" || q.postalcode!=="")){
            await account.findOne({userId: req.user._id.toString()}).then(async (obj)=>{
                obj.fname = q.fname
                obj.lname = q.lname
                obj.homeAddress = q.homeAddress
                obj.city = q.city
                obj.country = q.country
                obj.postalcode = q.postalcode
                await obj.save()
                await user.findOne({_id: req.user._id.toString()}).then(async(obj)=>{
                    obj.email = q.email
                    await obj.save()
                    res.status(200).send({})
                })
            })
        }
    }
}

module.exports.prompts = (req, res, next) => {
    if((!req.body.email && req.body.password) || (req.body.email && !req.body.password)) {
        if(!req.body.email){
            res.status(200).send(
                {
                    msg: "Please enter an email"
                }    
            )
        }
        else if(!req.body.password) {
            res.status(200).send(
                {
                    msg: "Please enter a password"
                }
            )
        }
    }
    else if(!req.body.email && !req.body.password) {
        res.status(200).send(
            {
                msg: "Fields cannot be empty"
            }
        )
    }
    else {
        next()
    } 
}

module.exports.verify = (req, res, next) => {
    // console.log("hitting verify")
    user.findOne({ email: req.body.email }).then(async (requiredUser) => {
        if(!requiredUser){
            // console.log("invalid email")
            res.status(200).send(
                {
                    msg: "Invalid email or Password"
                }
            )
        }else{
            await bcrypt.compare(req.body.password, requiredUser.password).then((flag) => {
                if(flag == false){
                    // console.log("invalid password")
                    res.status(200).send(
                        {
                            msg: "Invalid email or Password"
                        }
                    )
                }
                else{
                    // console.log("verify passed")
                    return next()
                }
            }).catch(next)
        }
    }).catch(next)
}
