const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt')

const userSchema = new schema({
    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minLength: [8, "Password cannot be less than 8 characters"],
    }
},
{
    timestamps: true
})

module.exports = mongoose.model('user', userSchema, 'users')