const mongoose = require('mongoose');
const schema = mongoose.Schema;
/* Schema.Types.ObjectId */ 

const question = require('./question.js')

const userFormSchema = new schema({
    userId: {
        type: String,
        match: [/^[a-f\d]{24}$/, 'Please enter a valid id'],
        required: [true, "User Id is required"],
        minLength: 24,
        maxLength: 24,
        trim: true,
        unique: true,
    },
    questions: [question],    
    ubunga: {
        type: Number,
        default: 8,
        required: true
    },
    __v: false
})
module.exports = mongoose.model('userForm', userFormSchema, 'userForms')