const braintree = require("braintree");
const account = require('../models/account.js');

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: "qcj7mbyc9y6t637d",
  publicKey: "yvkmmrtv928gw2d4",
  privateKey: "fe7d5c8f8727223160d4ab60bd186900"
});

module.exports.getClientToken = {
    get: async (req, res) => {
        console.log("generate client token")
        gateway.clientToken.generate({}, (err, response) => {
            if(err) {
                res.sendStatus(500)
            }
            res.send(response.clientToken);
        })
    }
}

module.exports.getPaymentMethods = {
    get: async (req, res) => {
        userid = req.user._id.toString()
        account.findOne({userId: userid}).then((obj)=>{
            // console.log(obj.subscriptionService.braintree.braintreeSubID)
            // if(!obj.subscriptionService.braintree.paymentMethods){
            //     return res.status(200).send([]);;
            // }
            paymentmethods = obj.subscriptionService.braintree.paymentMethods;
            res.status(200).send(paymentmethods);

        }).catch((err)=>{
            console.log(err)
            return res.status(400).send(err)
        })
    }
}

module.exports.getDate = {
    get: async (req, res, next) => {
      account.findOne({userId: req.user._id.toString()}).then((obj)=>{
        if(obj){
          res.status(200).send(
            {
              endDate: obj.endDate,
              subscriptionStatus: obj.subscriptionStatus
            }
          )
        }
        else{
          res.status(200).send({})
        }
      })
    }
}

module.exports.addPaymentMethod = {
    post: (req, res) => {

        const nonceFromTheClient = req.body.nonce;
        const customerid = req.body.customerid;
        // create a payment method nonce when activate then go to checkout to use that nonce to create subscription
        try{
            result = gateway.paymentMethod.create({
                customerId: customerid,
                paymentMethodNonce: nonceFromTheClient
            }, (err, result) => {
                if(err || result.errors){
                    return res.status(400).send({ error: err });
                    // return;
                }
                console.log(customerid)
                account.findOne({'subscriptionService.braintree.braintreeCusID': customerid.toString()}).then(
                    (obj)=>{
                        let flag = false
                        obj.subscriptionService.braintree.paymentMethods.filter(
                            (obj)=>{
                                if((obj.paymentMethodToken==result.paymentMethod.token) || (!result.paymentMethod.token)) {
                                    flag = true
                                }
                            }
                        )
                        if(flag) {
                            if(!result.paymentMethod.token){
                                return res.status(400).send("something went wrong")
                            }else{
                                return res.status(400).send("This account has already been added as a payment method")
                            }
                        }
                        
                        let paymentobject = {
                            cardservice : "",
                            paymentMethodToken: "",
                            buyeraccount : "",
                            endingDigits: ""
                        };
                        
                        // res.subscriptionService.braintree.paymentMethods.cardservice = result.paymentMethod.payerInfo.tenant;
                        if(result.paypalAccount){
                            console.log("paypal")
                            paymentobject.buyeraccount = result.paymentMethod.email;
                            paymentobject.cardservice = result.paymentMethod.payerInfo.tenant;
                        } else {
                            console.log("card")
                            console
                            paymentobject.endingDigits = result.paymentMethod.last4;
                            paymentobject.cardservice = result.paymentMethod.cardType;
                        }
                        paymentobject.paymentMethodToken = result.paymentMethod.token;
                        obj.subscriptionService.braintree.paymentMethods.push(paymentobject)
                        obj.save()
                        
                        return res.status(200).send({newmethod:paymentobject.paymentMethodToken})
                        // return;
                    }
                ).catch((err)=>{
                    console.log(err)
                    res.status(400).send(err)
                    return;
                })
                
            });
        } catch (error) {
            return res.status(400).send({ error: { message: error.message }});
            // return;
        ;}
    }
}

module.exports.subscribe = {
    post: async(req, res) => {
        // Use payment method nonce here
        let paymentmethodtoken = req.body.paymentmethodtoken
        let customerid = req.body.customerid
        let planid = req.body.planid
        
        await gateway.subscription.create({
            // paymentMethodToken: "the_token",
            paymentMethodToken: paymentmethodtoken,
            planId: planid
        }, (err, result) => {
                if(!result.success) {
                    return res.status(400).send("something went wrong");
                }
                
                account.findOne({'subscriptionService.braintree.braintreeCusID': customerid.toString()}).then(
                    (obj)=>{
                        const date = new Date();
                        date.setDate(date.getDate() + 34);
                        obj.endDate = date;
                        obj.subscribedOn = "Braintree";
                        obj.subscriptionStatus = "Subscribed";
                        obj.subscriptionService.braintree.braintreeSubID = result.subscription.id.toString();
                        obj.save()
                    }
                ).catch((err)=>{
                    console.log(err)
                    return res.status(400);
                    // return;
                })

                return res.status(200).send(result)
            }
        );
    }
}


module.exports.cancelsubscription = {
    post: async (req, res) => {
        account.findOne({userId: req.body.userid}).then((obj)=>{
            // console.log(obj.subscriptionService.braintree.braintreeSubID)
            gateway.subscription.cancel(obj.subscriptionService.braintree.braintreeSubID, (err, result) => {
                if(err){
                    res.status(400).send({ error: err });
                }
                // console.log(`statusCode: ${res.status}`);
                obj.subscriptionStatus = "Cancelled";
                obj.save();
                console.log("Successfully cancelled braintree subscription by SDK!")
                // console.log(result)
                res.status(200).send(result);
            });
        })
    }
}

module.exports.removePaymentMethod = {
    post: (req, res) => {
        let paymentmethodtoken = req.body.paymentmethodtoken
        let customerid = req.body.customerid
        result = gateway.paymentMethod.delete(paymentmethodtoken)
        .then((obj)=>{
            account.update({ 'subscriptionService.braintree.braintreeCusID': customerid.toString() }, { "$pull": { "subscriptionService.braintree.paymentMethods": { "paymentMethodToken": paymentmethodtoken } }}, { safe: true, multi:true }, function(err, obj) {
                // console.log(obj)
                if(err) {
                    return res.status(400).send(err);
                }
    
            });
            res.status(200).send({})
        }).catch((err)=>{
            // console.log(err)
            return res.status(400)
        })
    }
}

// app.post("/checkout", (req, res) => {
//     const nonceFromTheClient = req.body.payment_method_nonce;
//     // Use payment method nonce here

//     gateway.subscription.create({
//         // paymentMethodToken: "the_token",
//         paymentMethodNonce: nonceFromTheClient,
//         planId: "the_plan_id"
//       }, (err, result) => {
//         });
//   });