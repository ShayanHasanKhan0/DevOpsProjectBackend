require('dotenv').config()
const stripe = require("stripe")(process.env.requiredSTRIPE_SECRET_KEY);
const account = require('../models/account.js');

/* Exports */
/* Checkout Controller Body */

// create customer
// module.exports.createcustomer = {
//     post: async (req, res) => {
//       // Create a new customer object
//       const customer = await stripe.customers.create({
//              email: req.body.email,
//           });// save the customer.id as stripeCustomerId
//       // in your database.res.send({ customer });})
//       res.send({customer});
//     }
// }

// create subscription
module.exports.createsubscription = {
  post: async (req, res) => {// Set the default payment method on the customerlet paymentMethod;
    
    try {
    paymentMethod = await stripe.paymentMethods.attach(
      req.body.paymentMethodId.id,
     {
     customer: req.body.customerID,
     }
  );
  } catch (error) {return res.status(200).send({ error: { message: error.message } });}
  let updateCustomerDefaultPaymentMethod = await stripe.customers.update(
    req.body.customerID,
    { 
      invoice_settings: {
      default_payment_method: paymentMethod.id,
    },
  }
  );
  // Create the subscription
  const subscription = await stripe.subscriptions.create({customer: req.body.customerID,items: [{ price: process.env.PRICE_ID }],  // enter price id
  expand: ["latest_invoice.payment_intent"],});
  res.send(subscription);}
}

module.exports.getDate = {
  get: async (req, res, next) => {
    console.log("hitting getdate")
    account.findOne({userId: req.user._id.toString()}).then((obj)=>{
      if(obj){
        res.status(200).send(
          {
            endDate: obj.endDate
          }
        )
      }
      else{
        res.status(200).send({})
      }
    })
  }
}

// module.exports.webhook = {
//   post: async(request, response) => {
//     const sig = request.headers['stripe-signature'];
//     let event;
    
//     // return
//     try {
//       event = stripe.webhooks.constructEvent(request.body, request.headers['stripe-signature'], process.env.requiredSTRIPE_WEBHOOK_SECRET);
//       // console.log(event)
//     } catch (err) {
//       console.log(err.message)
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':{
//         // const paymentIntent = event.data.object;s
//         account.findOne({stripeCusID:event.data.object.customer}).then((obj)=>{
//           console.log("payment intent hit")
//           const date = new Date();
//           date.setDate(date.getDate() + 30);
//           obj.endDate = date
//           obj.save()
//         })
//         // Then define and call a function to handle the event payment_intent.succeeded
//         break;
//       }
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }
//     response.status(200).send("ok");
//   }
// }