/* Imports */
const user = require('./user')
const userForm = require('./userForm')

const forms = require('./forms')

/* Exports */
module.exports = {
    verify: user.verify,
    prompts: user.prompts,
    profile : user.profile,
    signUp: user.signUp,
    login: user.login,
    logout: user.logout,
    userForm: userForm,


    forms: forms
}