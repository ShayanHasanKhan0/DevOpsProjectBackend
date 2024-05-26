const mongoose = require('mongoose');
const schema = mongoose.Schema;

const accountSchema = new schema({
    userId: {
        type: String,
        required: true,
        minLength: 24,
        maxLength: 24
    },
    subscribedOn: {
        type: String,
        default:null
    },
    subscriptionStatus: {
        type: String,
        default:null
    },
    subscriptionService: {
        braintree: {
            braintreeCusID: {
                type: String,
                trim: true,
                required: true,
            },
            braintreeSubID: {
                type: String,
                trim: true,
                default:null,
            },
            paymentMethods: [
                {
                cardservice: {
                    type: String,
                    default:null,
                },
                paymentMethodToken: {
                    type:String,
                    default:null,
                },
                buyeraccount: {
                    type: String,
                    default:null,
                },
                endingDigits: {
                    type: String,
                    default:null,
                }
                }
            ]
        },
        // paypal: {
        //     paypalSubID: {
        //         type: String,
        //         trim: true,
        //         default:null,
        //     }
        // }
    },
    endDate: {
        type: Date,
        required: true,
        default: null
    },
    // fname: {
    //     type: String,
    //     trim: true,
    //     default: ""
    // },
    // lname: {
    //     type: String,
    //     trim: true,
    //     default: ""        
    // },
    // homeAddress: {
    //     type: String,
    //     trim: true,
    //     default: ""
    // },
    // city: {
    //     type: String,
    //     trim: true,
    //     default: ""
    // },
    // country: {
    //     type: String,
    //     trim: true,
    //     default: ""
    // },
    // postalcode: {
    //     type: String,
    //     trim: true,
    //     default: ""
    // }
})

module.exports = mongoose.model('account', accountSchema, 'accounts')