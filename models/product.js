const mongoose = require('mongoose');
const schema = mongoose.Schema;
/* Schema.Types.ObjectId */ 

const productSchema = new schema({
    title: {
        type: String,
        // required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        // required: [true, "Description is required"],
        trim: true
    },
    imagePath: {
        type: String,
        default: "",
        trim: true 
    },
    imageName: {
        type: String,
        default: "",
        trim: true 
    },
    link: {
        type: String,
        // required: [true, "URL is required"],
        trim: true
    },
    href: {
        type: String,
        // required: [true, "Href is required"],
        trim: true
    },
    additionalProperties: false,
})

module.exports = productSchema