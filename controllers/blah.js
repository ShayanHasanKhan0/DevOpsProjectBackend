const userForm = require('../models/userForm.js');

module.exports = {
    post: async (req, res, next) => {
        await userForm.create(req.body).then(
            (createdUser) => {
                res.status(201).send(createdUser)
            }
        ).catch(next)
    },
    get: async (req, res, next) => {
        res.status(200).send("hello " + req.user._id.toString())
    }
}