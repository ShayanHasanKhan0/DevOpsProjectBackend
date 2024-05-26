const mongoose = require('mongoose');
const schema = mongoose.Schema;

const product = require('./product.js')

const questionSchema = new schema({
    parentId: {
        type: String,
        match: [/^[a-f\d]{24}$/, 'Please enter a valid id'],
        required: [true, "Parent is required"],
        minLength: 24,
        maxLength: 24,
        trim: true
    },
    rootId: {
        type: String,
        required: [true, "Root is required"],
        match: [/^[a-f\d]{24}$/, 'Please enter a valid id'],
        minLength: 24,
        maxLength: 24,
        trim: true
    },
    level: {
        type: Number,
        min: 0,
        required: [true, "Level is required"],
    },

    
    name: {
        type: String,
        default: "",
        trim: true
    },
    question: {
        type: String,
        default: "",
        trim: true 
    },
    componentType: {
        type: String,
        enum: ['Question', 'Product', 'Reference'],
        default: "Question"
    },
    questionType: {
        type: String,
        enum: ['User Input', 'Select Text', 'Select Image', 'Range Slider'],
        default: "User Input"
    },
    selectImagePath: {
        type: String,
        trim: true 
    },
    selectImageName: {
        type: String,
        trim: true 
    },
    rangeFrom: {
        type: Number
    },
    rangeTo: {
        type: Number
    },
    selectText: {
        type: String,
        trim: true 
    },
    userInput:{
        type: String,
        enum: ['', 'Name', 'Email', 'Phone no.', 'Text'],
    },
    products:{
        type: [product],
        default: undefined
    },
    
    hasChild:{
        type: Boolean,
        required: [true, "hasChild is required"],
        default: false
    },
    count: {
        type: Number,
        default: 0,
    },
    customform:{
        style:{
            color:{
                type:String,
                default: ''
            }
        }
    },
    stats: {countries:[{type:String}]},
    additionalProperties: false,
})

module.exports = questionSchema