/* Imports */
const userForm = require('./userForm')

/* Exports */
module.exports = {
    get: async(req, res, next) => {

    },
    post: async(req, res, next) => {
        console.log(req.body)
        res.status(200).send()
    }
}